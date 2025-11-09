
"use server";

import { z } from "zod";
import { summarizeCleanlinessTips } from "@/ai/flows/telugu-chatbot-summaries";
import { generalQuery } from "@/ai/flows/general-query-flow";
import { segregateWaste } from "@/ai/flows/waste-segregation-flow";
import { revalidatePath } from "next/cache";
import { auth, firestore, storage } from "@/firebase";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, runTransaction, Timestamp, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Issue, FundingProject, UserProfile, SupportContact, Transaction } from "@/lib/data";


const issueSchema = z.object({
  description: z.string().min(10, "Please provide a more detailed description."),
  location: z.string().min(3, "Please specify a location."),
});


// Helper function to read issues from the firestore
export async function getIssues(): Promise<Issue[]> {
  try {
    const issuesCollection = collection(firestore, 'issues');
    const q = query(issuesCollection, orderBy("date", "desc"));
    const issueSnapshot = await getDocs(q);
    const issuesList = issueSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string if it exists
        date: data.date?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      } as Issue;
    });
    return issuesList;
  } catch (error) {
    console.error("Error reading issues from firestore:", error);
    return [];
  }
}


export async function reportIssueAction(prevState: any, formData: FormData) {
  const validatedFields = issueSchema.safeParse({
    description: formData.get("description"),
    location: formData.get("location"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error.",
    };
  }

  const photo = formData.get("photo") as File;
  let photoURL = "";

  try {
    if (photo && photo.size > 0) {
      const storageRef = ref(storage, `issues/${Date.now()}-${photo.name}`);
      const snapshot = await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(snapshot.ref);
    }
    
    const newIssue = {
      type: "Waste" as "Waste" | "Infrastructure",
      description: validatedFields.data.description,
      location: validatedFields.data.location,
      status: "Reported" as "Reported" | "In Progress" | "Resolved",
      reportedBy: "Guest User", // Or from user session
      date: serverTimestamp(),
      photoURL: photoURL,
    };
    
    await addDoc(collection(firestore, "issues"), newIssue);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/issues");
    revalidatePath("/");

    return {
      message: "Issue reported successfully!",
    };
  } catch (error: any) {
    console.error("Error reporting issue:", error);
    return {
      message: `Error reporting issue: ${error.message || "Please try again."}`,
      errors: {},
    }
  }
}

export async function getWasteSegregationGuidance(photoDataUri: string) {
    if (!photoDataUri) {
        return { error: "No photo data provided." };
    }
    try {
        const result = await segregateWaste({ photoDataUri });
        return result;
    } catch (error) {
        console.error("Error in waste segregation flow:", error);
        return { error: "Sorry, I couldn't analyze the image right now." };
    }
}


export async function getChatbotResponse(query: string) {
    if (!query) {
        return "Please provide a query.";
    }
    try {
        return await generalQuery(query);
    } catch (error) {
        console.error(error);
        return "Sorry, I couldn't process your request at this time.";
    }
}

export async function getChatbotCleanlinessTips() {
    // In a real app, this might come from a database or external API
    const expertTips = `
    1. Segregate waste into wet and dry.
    2. Do not throw garbage in open plots or drains.
    3. Use community bins for disposal.
    4. Start composting at home for wet waste.
    5. Participate in community clean-up drives.
    `;

    try {
        const result = await summarizeCleanlinessTips({ expertTips });
        return result.summary;
    } catch (error) {
        console.error(error);
        return "Sorry, I couldn't get the tips right now.";
    }
}

export async function isAdmin(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }
  try {
    const adminDocRef = doc(firestore, 'admins', email);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function getFundingProjects(): Promise<FundingProject[]> {
  try {
    const projectsCollection = collection(firestore, 'fundingProjects');
    const projectSnapshot = await getDocs(projectsCollection);
    const projectsList = projectSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FundingProject));
    return projectsList;
  } catch (error) {
    console.error("Error reading funding projects from firestore:", error);
    return [];
  }
}

export async function getFundingProject(id: string): Promise<FundingProject | null> {
    try {
        const projectRef = doc(firestore, 'fundingProjects', id);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            return { id: projectSnap.id, ...projectSnap.data() } as FundingProject;
        }
        return null;
    } catch (error) {
        console.error("Error fetching project:", error);
        return null;
    }
}


const projectSchema = z.object({
  title: z.string().min(3, "Title is too short."),
  description: z.string().min(10, "Description is too short."),
  goal: z.coerce.number().positive("Goal must be a positive number."),
});

export async function addProject(prevState: any, formData: FormData) {
  const validatedFields = projectSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error.",
    };
  }

  try {
    await addDoc(collection(firestore, "fundingProjects"), {
      ...validatedFields.data,
      current: 0,
    });
    revalidatePath('/dashboard/funding');
    revalidatePath('/dashboard');
    return { message: "Project added successfully." };
  } catch (error) {
    return { message: "Failed to add project." };
  }
}

export async function updateProject(id: string, prevState: any, formData: FormData) {
   const validatedFields = projectSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error.",
    };
  }

  try {
    const projectRef = doc(firestore, "fundingProjects", id);
    await updateDoc(projectRef, validatedFields.data);
    revalidatePath('/dashboard/funding');
    revalidatePath('/dashboard');
    return { message: "Project updated successfully." };
  } catch (error) {
    return { message: "Failed to update project." };
  }
}

export async function deleteProject(id: string) {
  try {
    await deleteDoc(doc(firestore, "fundingProjects", id));
    revalidatePath('/dashboard/funding');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error("Failed to delete project", error);
  }
}

export async function deleteIssue(id: string) {
  try {
    await deleteDoc(doc(firestore, "issues", id));
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/issues');
  } catch (error) {
    console.error("Failed to delete issue", error);
  }
}

export async function updateIssueStatus(id: string, status: Issue['status']) {
  try {
    const issueRef = doc(firestore, "issues", id);
    await updateDoc(issueRef, { status });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/issues');
  } catch (error) {
    console.error("Failed to update issue status:", error);
    throw new Error("Failed to update issue status.");
  }
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short.").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export async function updateUserProfile(uid: string, prevState: any, formData: FormData) {
  if (!uid) {
    return { message: "User not authenticated." };
  }
  
  const validatedFields = profileSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    const userDocRef = doc(firestore, 'users', uid);
    // Use setDoc with merge: true to create or update the document
    await setDoc(userDocRef, validatedFields.data, { merge: true });
    revalidatePath('/dashboard/profile');
    return { message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { message: "Failed to update profile." };
  }
}

// Support Contacts Actions
export async function getSupportContacts(): Promise<SupportContact[]> {
  try {
    const contactsCollection = collection(firestore, 'supportContacts');
    const contactSnapshot = await getDocs(query(contactsCollection, orderBy('name')));
    if (contactSnapshot.empty) {
        return [
          { id: '1', name: 'Police', number: '100' },
          { id: '2', name: 'Ambulance', number: '108' },
          { id: '3', name: 'Fire Department', number: '101' },
          { id: '4', name: 'Local Municipality Office', number: '08816-223344' },
        ];
    }
    return contactSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SupportContact));
  } catch (error) {
    console.error("Error fetching support contacts:", error);
    return [];
  }
}

const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  number: z.string().min(3, "A valid number is required."),
});

export async function addSupportContact(prevState: any, formData: FormData) {
  const validatedFields = contactSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    await addDoc(collection(firestore, "supportContacts"), validatedFields.data);
    revalidatePath('/dashboard/support');
    return { message: "Contact added successfully." };
  } catch (error) {
    return { message: "Failed to add contact." };
  }
}

export async function updateSupportContact(id: string, prevState: any, formData: FormData) {
  const validatedFields = contactSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  try {
    const contactRef = doc(firestore, "supportContacts", id);
    await updateDoc(contactRef, validatedFields.data);
    revalidatePath('/dashboard/support');
    return { message: "Contact updated successfully." };
  } catch (error) {
    return { message: "Failed to update contact." };
  }
}

export async function deleteSupportContact(id: string) {
  try {
    await deleteDoc(doc(firestore, "supportContacts", id));
    revalidatePath('/dashboard/support');
  } catch (error) {
    console.error("Failed to delete contact:", error);
  }
}


const contributionSchema = z.object({
    amount: z.coerce.number().positive("Contribution must be a positive number."),
    paymentMethod: z.enum(['online', 'cash']),
});

export async function contributeToProject(projectId: string, prevState: any, formData: FormData) {
    const validatedFields = contributionSchema.safeParse(Object.fromEntries(formData));
    const user = auth.currentUser;
    const userProfile = user ? await getUserProfile(user.uid) : null;

    if (!user) {
        return { message: "You must be logged in to contribute." };
    }

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation Error.",
        };
    }
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const projectRef = doc(firestore, "fundingProjects", projectId);
            const projectDoc = await transaction.get(projectRef);

            if (!projectDoc.exists()) {
                throw "Project does not exist!";
            }

            // Update project's current amount
            const newCurrentAmount = projectDoc.data().current + validatedFields.data.amount;
            transaction.update(projectRef, { current: newCurrentAmount });

            // Create a new transaction document
            const transactionRef = doc(collection(firestore, "transactions"));
            transaction.set(transactionRef, {
                projectId: projectId,
                amount: validatedFields.data.amount,
                paymentMethod: validatedFields.data.paymentMethod,
                date: serverTimestamp(),
                contributorId: user.uid,
                contributorName: userProfile?.name || user.email || "Anonymous",
            });
        });

        revalidatePath('/dashboard/funding');
        revalidatePath(`/dashboard/funding/${projectId}`);
        revalidatePath('/dashboard');
        return { message: "Thank you for your contribution!" };
    } catch (error) {
        console.error("Transaction failed: ", error);
        return { message: "Failed to contribute to project." };
    }

}

export async function getTransactionsForProject(projectId: string): Promise<Transaction[]> {
    try {
        const transactionsCollection = collection(firestore, 'transactions');
        const q = query(transactionsCollection, where("projectId", "==", projectId), orderBy("date", "desc"));
        const transactionSnapshot = await getDocs(q);

        const transactionsList = transactionSnapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.date as Timestamp;
            return {
                id: doc.id,
                ...data,
                date: date ? date.toDate().toLocaleDateString('en-IN') : 'N/A',
            } as Transaction;
        });

        return transactionsList;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}
