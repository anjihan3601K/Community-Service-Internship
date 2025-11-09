# Mana Ooru Mana Badyatha (Our Village, Our Responsibility)

This is a Next.js application for the "Mana Ooru Mana Badyatha" project, generated in Firebase Studio. Its goal is to empower the residents of Ramaraju Lanka to build a cleaner and better community.

## Getting Started

To run the application locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables**:
    The application uses Google's Gemini API for its AI features. You need to provide an API key for these features to work.
    *   The `.env` file in the root of the project should contain your API key.
    *   If the key is missing, go to [Google AI Studio](https://aistudio.google.com/app/apikey) to generate one.
    *   Add the following line to your `.env` file, replacing `<YOUR_API_KEY_HERE>` with the key you just created:
        ```
        GEMINI_API_KEY=<YOUR_API_KEY_HERE>
        ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    This will start the Next.js application, usually on `http://localhost:9002`.

4.  **Run the Genkit AI Server (in a separate terminal)**:
    For the AI chatbot and waste segregation features to work, you also need to run the Genkit server.
     ```bash
    npm run genkit:watch
    ```
    This watches for changes in your AI code.

Now you can open `http://localhost:9002` in your browser to see the application.

For a detailed overview of the project's architecture, see `SYSTEM_IMPLEMENTATION.md`.
