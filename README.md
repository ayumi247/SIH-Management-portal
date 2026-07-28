# SIH Matchmaker Portal

Welcome to the **SIH Matchmaker Portal**! This is a full-stack web application built to help college students easily form teams, find teammates with specific skills, and manage their hackathon participation (specifically built for the Smart India Hackathon).

Whether you are a developer looking to contribute or someone who just wants to run it locally, this guide will walk you through the setup process step-by-step. Don't worry if you're a beginner; we've kept things simple!

---

## Tech Stack

This project is divided into two main parts:
1. **Frontend (User Interface):** Built with **Next.js** (React) and styled with CSS.
2. **Backend (Server & Logic):** Built with **FastAPI** (Python). 
3. **Database:** Powered by **PostgreSQL** (using Supabase) and managed via **SQLModel**.

---

## Prerequisites

Before you start, make sure you have the following installed on your computer:
* **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
* **Python** (v3.10 or higher) - [Download here](https://www.python.org/downloads/)
* **Git** - [Download here](https://git-scm.com/)
* A **Supabase** account (for your free PostgreSQL database)

---

## Local Setup Guide

Follow these steps exactly in order to get the project running on your own machine.

### Step 1: Get the Code
First, download the code to your computer. Open your terminal or command prompt and run:
```bash
git clone https://github.com/ayumi247/SIH-Management-portal.git
cd SIH-Management-portal
```

---

### Step 2: Set up the Backend (FastAPI)
The backend is the "brain" of the app. We need to install its dependencies and start it up.

1. Open a new terminal window and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a "Virtual Environment" (a safe, isolated space for Python packages):
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   * **Windows:** `venv\Scripts\activate`
   * **Mac/Linux:** `source venv/bin/activate`
4. Install all the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up your Environment Variables:
   * Create a file named `.env` inside the `backend` folder.
   * Open the `.env.example` file, copy its contents, and paste them into your new `.env` file.
   * Replace the dummy values with your actual database URL and API keys.
6. Start the backend server!
   ```bash
   uvicorn main:app --reload
   ```
   *Your backend is now running at `http://127.0.0.1:8000`! Leave this terminal open.*

---

### Step 3: Set up the Frontend (Next.js)
Now let's start the visual part of the app.

1. Open a **second** terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install all the required Node.js packages:
   ```bash
   npm install
   ```
3. Set up your Environment Variables:
   * Create a file named `.env.local` inside the `frontend` folder.
   * Open the `.env.example` file, copy its contents, and paste them into your new `.env.local` file.
4. Start the frontend website!
   ```bash
   npm run dev
   ```
   *Your website is now live at `http://localhost:3000`!*

---

## You're Done!
Open your web browser and go to `http://localhost:3000`. You should see the SIH Matchmaker Portal running perfectly. 

### Need help understanding the code?
If you are completely new to web development and want to understand how all these files work together, check out the [`simpler-documentation.md`](./simpler-documentation.md) file included in this folder!
