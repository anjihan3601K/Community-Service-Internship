# System Implementation: Mana Ooru Mana Badyatha

## 1. Overview

"Mana Ooru Mana Badyatha" is a modern, full-stack web application designed to empower the residents of Ramaraju Lanka. It provides a platform for community engagement by enabling users to report local issues, crowdfund development projects, and access important information, all facilitated by an AI-powered chatbot.

## 2. Frontend Architecture (The User Interface)

*   **Framework**: The application is built using **Next.js**, a powerful React framework. This choice enables Server-Side Rendering (SSR) and Static Site Generation (SSG), which leads to a faster, more SEO-friendly application. We use the modern **App Router** for intuitive routing and layout management.
*   **Language**: **TypeScript** is used for all frontend code, providing strong type-safety that helps prevent common bugs and improves developer productivity.
*   **UI Components**: The user interface is constructed with **ShadCN UI**, a collection of accessible and beautifully designed components. This ensures a consistent and professional look and feel across the application.
*   **Styling**: **Tailwind CSS** is used for all styling. It’s a utility-first CSS framework that allows for rapid and custom UI development while maintaining a consistent design system. The app's theme is fully customizable through `globals.css`.
*   **State Management**: For client-side state, we use a combination of React's built-in hooks (`useState`, `useEffect`, `useContext`) and server actions, which simplifies data mutations without needing a complex state management library.

## 3. Backend Architecture (The "Engine Room")

The entire backend is powered by **Firebase**, a serverless platform from Google.

*   **Database**: **Cloud Firestore** is used as the NoSQL database. It stores all the application data, including user profiles, issue reports, funding projects, and transactions. Its real-time capabilities are perfect for a dynamic application like this.
*   **User Authentication**: **Firebase Authentication** handles all user sign-up, sign-in, and session management. It provides a secure and easy-to-implement authentication system.
*   **File Storage**: **Firebase Storage** is used to handle all file uploads. When a user uploads a photo for an issue report, the image is securely stored here, and a URL is saved in the Firestore database.

## 4. Artificial Intelligence (The Chatbot)

*   **AI Framework**: **Genkit**, a modern framework for building AI-powered applications, is used to connect to and manage the AI models.
*   **AI Model**: The chatbot and other AI features are powered by Google's **Gemini API** (specifically, the `gemini-2.5-flash` model). This powerful Large Language Model (LLM) understands and responds in English, Telugu, and "Tanglish," making it highly accessible to the local community.
*   **AI Flows**: The AI logic is organized into "flows" within the `src/ai/flows/` directory. These are server-side functions that define the prompts and business logic for how the AI should respond to different user queries, such as general questions or drafting an issue report.

## 5. Core Feature Data Flows

Here is a high-level overview of how data moves through the system for key features.

### Flow 1: User Reports a New Issue

1.  **User Interaction**: The user clicks the "Report Issue" button on the dashboard. A dialog (`ClientDialog`) appears containing the `IssueReportForm`.
2.  **Form Submission**: The user fills in the issue description, location, and optionally uploads a photo. They click "Report Issue".
3.  **Client to Server**: The form data, including the image file, is sent from the client to a Next.js Server Action (`reportIssueAction`).
4.  **Image Upload**: The server action first uploads the image file (if provided) to a dedicated `issues/` folder in **Firebase Storage**.
5.  **Get Image URL**: Upon successful upload, Firebase Storage returns a unique, public URL for the stored image.
6.  **Database Write**: The server action then creates a new document in the `issues` collection in **Cloud Firestore**. This document contains the description, location, status ("Reported"), user info, and the `photoURL` from the previous step.
7.  **UI Update**: The server action uses Next.js's `revalidatePath` to tell the application to refresh the data for the dashboard and issues pages. This ensures the newly reported issue appears almost instantly without a manual page reload.

### Flow 2: Admin Updates an Issue Status

1.  **Admin Interaction**: An admin navigates to the "All Issues" page and finds the issue they want to update.
2.  **Action Trigger**: The admin clicks the "Actions" menu for an issue and selects a new status (e.g., "In Progress").
3.  **Client to Server**: This action calls the `updateIssueStatus` Server Action, passing the `issueId` and the new `status`.
4.  **Database Update**: The server action finds the corresponding document in the `issues` collection in Firestore and updates its `status` field.
5.  **UI Update**: `revalidatePath` is called, and the UI on both the "All Issues" page and the dashboard automatically reflects the new status badge for that issue.

### Flow 3: User Contributes to a Funding Project

1.  **User Interaction**: A logged-in user clicks the "Fund Project" button on a project card.
2.  **Open Dialog**: The `FundProjectDialog` component opens, showing project details and a form for the contribution amount and payment method.
3.  **Payment Simulation**:
    *   If "Cash" is selected, the form proceeds directly to the server action.
    *   If "Online" is selected, the dialog moves to a second step, displaying payment instructions (phone number, QR code). The user must click "I Have Completed the Payment" to proceed.
4.  **Client to Server**: The contribution details (amount, payment method) and the `projectId` are sent to the `contributeToProject` Server Action.
5.  **Database Transaction**: This is a critical step. The action uses a **Firestore Transaction** to ensure data integrity. A transaction guarantees that both of the following operations succeed or fail together:
    *   **Update Project**: It reads the project's current funding amount and atomically increases it by the contribution amount.
    *   **Create Transaction Record**: It creates a new document in the `transactions` collection, recording the contributor's details, amount, date, and a reference to the project.
6.  **UI Update**: The action calls `revalidatePath`, which refreshes the funding page and dashboard. The project's progress bar and "Raised" amount are updated, and the new transaction becomes visible to admins.

## 6. Deployment

The application is configured for seamless deployment on **Firebase App Hosting**, a secure, high-performance hosting service built for modern web apps. The `apphosting.yaml` file contains the basic configuration for deployment.
