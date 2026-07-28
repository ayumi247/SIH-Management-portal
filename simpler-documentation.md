# A Beginner's Guide to the Code

Welcome! If you're new to web development, looking at a bunch of folders and code files can be overwhelming. This guide is written in plain English to help you understand exactly how this app works, piece by piece. 

Think of this app like a restaurant. We have the **Dining Area** (Frontend), the **Kitchen** (Backend), and the **Pantry** (Database).

---

## 1. The Frontend (The Dining Area)
**Folder:** `frontend/`
**Technology:** Next.js (React)

The frontend is what the user actually sees and interacts with. It's the buttons, the text, the colors, and the forms. Just like a dining area in a restaurant, it needs to look good and be easy to navigate.

* **How it works:** We use **React**, which lets us build the website using "components" (like lego blocks). For example, a "Button" is a component that we can reuse anywhere. 
* **Next.js:** This is a framework that makes React even faster and helps us create different pages (like `/login`, `/dashboard`, etc.). 
* **When you click a button:** (Like "Create Team"), the frontend sends a message (an HTTP Request) to the Backend asking it to do the heavy lifting.

---

## 2. The Backend (The Kitchen)
**Folder:** `backend/`
**Technology:** FastAPI (Python)

The backend is the brain of the app. Users never see the backend directly. Just like a kitchen, it receives orders (requests) from the frontend, processes them, and sends the food (data) back out.

* **How it works:** We use **FastAPI**, which is a super fast Python tool for building "APIs". An API is basically a menu of actions the backend can perform (like `POST /teams` to create a team).
* **What it does:** 
  * It checks if a user is allowed to do something (Authentication).
  * It enforces rules (e.g., "You can't be in two teams at once!").
  * It sends automated emails in the background.
  * It handles real-time chat so teammates can talk to each other.

---

## 3. The Database (The Pantry)
**Technology:** PostgreSQL (Hosted on Supabase)

The database is where we permanently store all our information. If the power goes out, the database remembers everything. 

* **How it works:** It stores data in tables, just like Excel spreadsheets. We have a table for `Users`, a table for `Teams`, and a table for `Colleges`.
* **How the Backend talks to it:** The backend uses a tool called **SQLModel**. Instead of writing complicated database code, SQLModel lets our Python code talk to the database smoothly. 

---

## Putting It All Together (The Full Journey)

Let's imagine a user wants to join a team. Here is exactly what happens behind the scenes:

1. **The User** clicks the "Request to Join" button on the **Frontend** website.
2. The **Frontend** sends a message over the internet to the **Backend**: *"Hey Backend, User X wants to join Team Y!"*
3. The **Backend** receives the message and thinks: *"Let me check the rules. Is User X already in a team?"*
4. The **Backend** asks the **Database**: *"Are they in a team?"*
5. The **Database** replies: *"Nope, they are free!"*
6. The **Backend** saves the new request in the **Database**, and then sends an automated Email to the team leader.
7. Finally, the **Backend** replies back to the **Frontend**: *"Success! Request sent."*
8. The **Frontend** shows a green checkmark to the **User**!

---

## Want to read the code? Start here!

If you want to explore the code, here are the best files to look at first:
* **Frontend:** Look inside `frontend/src/app/page.tsx` to see how the home page is built.
* **Backend:** Look inside `backend/app/api/routers/teams.py` to see the exact Python logic for how teams are created and managed!
