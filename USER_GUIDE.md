# User Guide - SaaS Application

## 1. Authentication

This section guides you through logging in, registering for a new account, and logging out of the application.

### 1.1. Logging In

To access your account:

1.  Navigate to the login page. Typically, this is the default page if you are not logged in, or you can access it via the `/login` path.
2.  Enter your registered **Email** address in the 'Email' field.
3.  Enter your **Password** in the 'Password' field.
4.  Click the **"Iniciar Sesión"** button. (Note: The Login page component uses "Iniciar Sesión" as the button text).

**Successful Login:**
Upon successful login, you will be redirected to the application's main dashboard or home page (`/`).

**Login Errors:**
If there's an issue with your login attempt (e.g., incorrect email or password), an error message will be displayed on the login page. Please double-check your credentials and try again. Common messages include errors if the account is not found or if the email has not yet been confirmed. If your email is not confirmed, the system may provide instructions or a button (in development mode) to help activate the account.

### 1.2. Registering a New Account

If you are a new user, you need to create an account:

1.  Navigate to the registration page. You can usually find a link like "¿No tienes una cuenta? Regístrate" on the login page, or access it via the `/register` path.
2.  Fill out the registration form. The following fields are required:
    *   **Email:** Your email address (this will be your username).
    *   **Password:** Choose a strong password.
    *   **Nombre (Name):** Your first name.
    *   **Apellido (Last Name):** Your last name.
3.  Once all fields are completed, click the **"Registrarse"** button.

**After Registration:**
After submitting the registration form, the system will process your request.
*   You will see a message indicating "¡Registro exitoso!"
*   Crucially, you **must check your email inbox** for a confirmation message sent to the email address you provided. This email contains a link to verify and activate your account.
*   The registration page will then automatically redirect you to the login page (`/login`) after a few seconds. You will need to confirm your email before you can successfully log in.

### 1.3. Email Confirmation

The application requires you to confirm your email address to activate your account and enable login.

1.  After registering, check your email inbox (and spam/junk folder) for an email from the application.
2.  Open the email and click on the confirmation link provided.
3.  Clicking this link will take you to the email confirmation page (typically a route like `/confirm-email#access_token=YOUR_TOKEN_HERE`).
4.  This page will process the confirmation:
    *   If successful, it will display a message like "Email confirmado exitosamente. Redirigiendo..." and then automatically log you in by redirecting you to the home page (`/`).
    *   If there's an issue (e.g., invalid or expired link), it will display an error message like "No se encontró token de acceso. Intenta iniciar sesión manualmente." and redirect you to the login page.

Once your email is confirmed and you are logged in, you can fully access the application.

### 1.4. Logging Out

To log out of the application:

1.  While logged in, navigate to the home page (`/`).
2.  You will find a **"Cerrar sesión"** button displayed on this page.
3.  Clicking this button will end your session, remove your authentication token from the browser, and redirect you to the login page (`/login`).

## 2. Category Management

Categories are used to organize your products. This section explains how to manage these categories.

### 2.1. Accessing Category Management

To manage product categories, navigate to the "Category Management" section of the application. This would typically be available via a navigation menu or dashboard link.
*(Note: As of the current application setup, a direct route like `/categories` is not yet defined in the main application router. This section assumes such access will be implemented.)*

### 2.2. Viewing Categories

Upon accessing the Category Management page (titled "Category Management"), you will see a list under "Existing Categories". Each category entry in the list displays:
*   The **Category Name**.

Each category in the list will also have an "Edit" and a "Delete" button next to it.

### 2.3. Adding a New Category

To add a new category:

1.  The form for adding categories is usually visible by default at the top of the page, titled "Add New Category".
2.  Enter the name for the new category in the input field labeled **"Category Name"**. The placeholder text is "Enter category name".
3.  Click the **"Add Category"** button.
4.  The new category will appear in the "Existing Categories" list below. If there's an error (e.g., the category name is empty or an API error occurs), an error message like "Category name cannot be empty." or a server-provided message will be displayed near the form.

### 2.4. Editing an Existing Category

To modify an existing category:

1.  Find the category you wish to edit in the "Existing Categories" list.
2.  Click the **"Edit"** button associated with that category.
3.  This will populate the form at the top of the page with the category's current information, and the form title will change to "Edit Category".
4.  Change the **Category Name** in the input field as needed.
5.  Click the **"Update Category"** button.
6.  A **"Cancel"** button is also available next to the "Update Category" button if you wish to discard changes without saving. Clicking "Cancel" will clear the form and revert it to "Add New Category" mode.
7.  The category list will update to reflect your changes upon successful submission. Error messages will be shown near the form if the update fails.

### 2.5. Deleting a Category

To remove a category:

1.  Find the category you wish to delete in the "Existing Categories" list.
2.  Click the **"Delete"** button associated with that category.
3.  A browser confirmation prompt will appear stating: **"Are you sure you want to delete this category?"**.
4.  Confirm the deletion by clicking "OK" (or your browser's equivalent). The category will be removed from the list. If deletion fails (e.g., due to a server-side restriction or error), an error message will be displayed on the page.

## 3. Product Management

This section details how to manage your products, including adding new products, organizing them by category, importing them from Excel, and monitoring stock levels.

### 3.1. Accessing Product Management

Navigate to the "Product Management" section of the application to manage your inventory. This is usually available via a main navigation menu or dashboard.
*(Note: As of the current application setup, a direct route like `/products` is not yet defined in the main application router. This section assumes such access will be implemented.)*

### 3.2. Viewing Products

On the Product Management page (titled "Product Management"), you will see a "Products List". For each product, the following information is displayed in a table:
*   **Name:** The name of the product.
*   **Description:** A brief description of the product.
*   **Price:** The selling price of the product (e.g., $10.00).
*   **Stock:** The current quantity of the product in stock.
*   **Category:** The name of the category the product belongs to.

Each product row also has "Edit" and "Delete" buttons.

### 3.3. Filtering Products by Category

You can filter the product list to see items from a specific category:
1.  Locate the **"Filter by Category:"** dropdown menu, usually found above the "Products List".
2.  Select a category from the dropdown. The product list will update to show only products belonging to the selected category.
3.  To see all products again, select the "All Categories" option from the dropdown.

### 3.4. Adding a New Product

To add a new product to your inventory:

1.  Click the **"Add New Product"** button. This will display a form titled "Add New Product".
2.  Fill in the product details:
    *   **Name:** (Required) The name of the product.
    *   **Description:** A description for the product.
    *   **Price:** (Required) The price of the product (e.g., 19.99).
    *   **Stock:** (Required) The initial stock quantity.
    *   **Category:** (Required) Select a category from the dropdown list. If no categories are available, you may need to add them first (see Category Management).
3.  Click the **"Add Product"** button.
4.  The new product will appear in the "Products List". If there are issues (e.g., missing required fields like "Name, Price, Stock, and Category are required."), an error message will be displayed within the form area.

### 3.5. Editing an Existing Product

To modify an existing product:

1.  Find the product in the "Products List" and click its **"Edit"** button.
2.  The product form will appear (titled "Edit Product"), pre-filled with the current details.
3.  Update the necessary information (Name, Description, Price, Stock, Category).
4.  Click the **"Update Product"** button to save your changes.
5.  A **"Cancel"** button is also available if you wish to discard changes without saving.
6.  The "Products List" will reflect the changes upon successful update.

### 3.6. Deleting a Product

To remove a product:

1.  Find the product in the "Products List" and click its **"Delete"** button.
2.  A browser confirmation prompt will appear stating: **"Are you sure you want to delete this product?"**.
3.  Confirm by clicking "OK". The product will be removed from the list. If there's an error during deletion, a message will be displayed on the page.

### 3.7. Importing Products from Excel

The system allows you to import multiple products at once using an Excel file (`.xlsx` or `.xls`).

1.  Click the **"Import Products from Excel"** button. This will display a form titled "Import Products from Excel".
2.  Click the file input field labeled **"Select Excel File (.xlsx, .xls)"** to choose the Excel file from your computer.
3.  Click the **"Upload and Import"** button.
4.  The system will process the file.
    *   If successful, a message like "Products imported successfully!" will be shown.
    *   If there are issues, an error message will be displayed (e.g., "Please select an Excel file to import." or "Error importing products. Check file format.").
    *   *(Note: The specific column format required within the Excel file (e.g., 'ProductName', 'Price', 'Stock', 'CategoryID') needs to be predefined according to backend requirements. This guide does not detail the exact Excel structure.)*
5.  The "Products List" will update to include the newly imported products.

### 3.8. Low Stock Alerts

The Product Management page helps you identify items that are running low on stock.
A **"Low Stock Alert:"** section will appear above the product list if any products have stock levels at **10 units or less**.
This alert, styled as a warning, will list each low-stock product by its **Name** and current **Stock** level (e.g., "Product Name (Stock: 5)"). This helps you quickly identify items that may need restocking.

## 4. Customer Management

This section explains how to manage your customer database, including adding new customers, searching for existing ones, and updating or deleting their information.

### 4.1. Accessing Customer Management

Navigate to the "Customer Management" section of the application to manage your customer records. This is usually available via a main navigation menu or dashboard.
*(Note: As of the current application setup, a direct route like `/customers` is not yet defined in the main application router. This section assumes such access will be implemented.)*

### 4.2. Viewing Customers

On the Customer Management page (titled "Customer Management"), you will see a table listing your customers. For each customer, the following information is displayed:
*   **ID:** The unique identifier for the customer.
*   **Name:** The customer's full name.
*   **Email:** The customer's email address.
*   **Phone:** The customer's phone number.
*   **Address:** The customer's physical address (displays 'N/A' if not provided).

Each customer row also has "Edit" and "Delete" buttons.

### 4.3. Searching for Customers

If you have many customers, you can use the search functionality to find specific ones:
1.  Locate the **Search Bar** above the customer list. The placeholder text is "Search by name, email, or phone...".
2.  Enter your search query (e.g., customer name, email, or phone number) into the search field.
3.  Click the **"Search"** button or press Enter. The customer list will update to show only customers matching your query. The search button text will change to "Searching..." while the search is in progress.
4.  To clear the search and view all customers, empty the search field and click the "Search" button again (or press Enter).

### 4.4. Adding a New Customer

To add a new customer to your database:

1.  Click the **"Add New Customer"** button, typically found above the search bar. This will display a form titled "Add New Customer".
2.  Fill in the customer's details:
    *   **Name:** (Required) The customer's full name.
    *   **Email:** (Required) The customer's email address.
    *   **Phone:** The customer's phone number.
    *   **Address:** The customer's physical address (can be multiple lines).
    *   (Required fields are usually marked with a red asterisk `*` next to their labels.)
3.  Click the **"Add Customer"** button.
4.  The new customer will appear in the customer list. If there are issues (e.g., missing required fields like "Name and Email are required," or an "Email address is invalid."), an error message will be displayed within the form area.

### 4.5. Editing an Existing Customer

To update the information for an existing customer:

1.  Find the customer in the list and click their **"Edit"** button.
2.  The customer form will appear, titled "Edit Customer", and pre-filled with their current details.
3.  Update the necessary information (Name, Email, Phone, Address).
4.  Click the **"Update Customer"** button to save your changes.
5.  A **"Cancel"** button is also available if you wish to discard changes without saving.
6.  The customer list will reflect the changes upon successful update. Error messages will be displayed in the form area if the update fails.

### 4.6. Deleting a Customer

To remove a customer from your database:

1.  Find the customer in the list and click their **"Delete"** button.
2.  A browser confirmation prompt will appear stating: **"Are you sure you want to delete this customer?"**.
3.  Confirm by clicking "OK" (or your browser's equivalent). The customer will be removed from the list. If there's an error during deletion (e.g., the customer is associated with sales records), a message will be displayed on the page.

## 5. Point of Sale (POS) System

The Point of Sale (POS) system is where you create and manage sales transactions. It is titled "Point of Sale" on the page.

### 5.1. Accessing the POS System

Navigate to the "POS" or "New Sale" section of the application to open the Point of Sale interface.
*(Note: As of the current application setup, a direct route like `/pos` is not yet defined in the main application router. This section assumes such access will be implemented.)*

### 5.2. POS Interface Overview

The POS interface is divided into two main columns:

*   **Product Selection Area (Left Side):**
    *   Titled "Products".
    *   Contains a search bar with the placeholder "Search products by name...".
    *   Lists available products, showing each product's name, price, and current stock.
    *   Each product has an "Add to Cart" button.
*   **Current Sale Area (Right Side):**
    *   Titled "Current Sale".
    *   Features a customer selection dropdown.
    *   Displays items added to the cart, including quantity controls.
    *   Shows the total sale amount.
    *   Contains the "Complete Sale" button.

Error messages (e.g., for stock issues, general errors, or sale success) are displayed at the top of the page.

### 5.3. Creating a New Sale

#### 5.3.1. Selecting Products

1.  In the **Product Selection Area**, find products by scrolling through the list or by using the **Search Bar** at the top of this area. Type a product name to filter the list dynamically.
2.  To add a product to the current sale, click its **"Add to Cart"** button. This adds one unit of the product by default.
3.  **Stock Validation:**
    *   The "Add to Cart" button will be disabled if the product's stock is zero, or if the quantity already in your cart matches the available stock.
    *   If you attempt to add more products than available (e.g., by repeatedly clicking "Add to Cart" or through quantity adjustments), a warning message like "Cannot add X product(s). Only Y available in stock (already Z in cart)." will appear.

#### 5.3.2. Managing the Cart

Once products are added, they appear in the **Current Sale Area**. Here you can:

*   **View Items:** Each item in the cart displays its name, price per unit (e.g., "$10.00 ea."), the current quantity, and the total price for that item line (e.g., "Item Total: $20.00").
*   **Adjust Quantity:**
    *   Use the **"+"** and **"-"** buttons next to each item's quantity to increment or decrement.
    *   You can also directly type a number into the quantity input field.
    *   The system prevents increasing the quantity beyond the product's available stock, showing a warning like "Cannot set quantity to X. Only Y available in stock." if you try.
    *   If an item's quantity is reduced to 0 (e.g., by typing "0" or decrementing from 1), it will be automatically removed from the cart.
*   **Remove an Item:** Click the **"Remove"** button next to an item to delete it from the cart.
*   **View Cart Total:** A running total of the sale amount is displayed prominently (e.g., "Total: $30.00").

#### 5.3.3. Selecting a Customer (Optional)

You can associate the sale with a specific customer:

1.  Locate the **Customer Selection Dropdown** labeled "Select Customer (Optional)" in the "Current Sale" area.
2.  Choose an existing customer from the list. Customers are displayed as "Customer Name (customer.email)".
3.  If no customer is selected (the default "Walk-in / No Customer" option is chosen), the sale will be processed anonymously.

### 5.4. Completing the Sale

1.  Once all items are in the cart and a customer (if any) is selected, click the **"Complete Sale"** button at the bottom of the "Current Sale" area.
2.  The system will process the sale. This involves:
    *   Recording the transaction details (items, quantities, prices, total, and customer if selected).
    *   The backend system will update product stock levels accordingly.
3.  **Feedback:**
    *   **Success:** If the sale is recorded successfully, a success message (e.g., "Sale recorded successfully!") will be displayed. The cart will be cleared, the selected customer will be reset, and the product search term will be cleared. The product list will also refresh to show updated stock levels.
    *   **Error:** If there are issues (e.g., cart is empty, API errors), an error message (e.g., "Cannot complete sale with an empty cart." or "Failed to record sale.") will be displayed at the top of the page. You may need to address the issue (like adding items to the cart) and try again.
    *   During processing, the "Complete Sale" button will show "Processing...".

## 6. Sales Reports

The Sales Reports section allows you to view and analyze your past sales transactions. The page is titled "Sales Reports".

### 6.1. Accessing Sales Reports

Navigate to the "Sales Reports" or "Reports" section of the application to view your sales data. This is usually available via a main navigation menu or dashboard.
*(Note: As of the current application setup, a direct route like `/sales-reports` is not yet defined in the main application router. This section assumes such access will be implemented.)*

### 6.2. Viewing Sales Data

Upon accessing the Sales Reports page, you will see a table listing your sales transactions. Each row in the table represents a single sale and displays the following information:
*   **Sale ID:** The unique identifier for the sale (e.g., `sale.id_venta`).
*   **Date:** The date and time the sale occurred (e.g., formatted as MM/DD/YYYY HH:MM:SS).
*   **Customer:** The name of the customer who made the purchase. If the sale was to a walk-in customer or the customer was not specified, it may display "N/A (Walk-in)" or the customer's ID.
*   **Total Amount:** The total monetary value of the sale (e.g., $49.99).
*   **Items Sold:** The total number of individual items sold in that transaction.

If no sales data is available for the selected period or criteria, a message like "No sales found for the selected criteria." will be displayed.

### 6.3. Filtering Sales Reports

To analyze sales for specific periods, you can use the available filters:

#### 6.3.1. Date Range Filter
1.  Locate the **Start Date** and **End Date** input fields. These are labeled "Start Date" and "End Date" respectively.
2.  Select your desired start and end dates using the date pickers.
3.  Click the **"Apply Filters"** button. The button text changes to "Loading..." while the data is being fetched.
4.  The sales table will update to show only transactions that occurred within (and including) the selected date range. The data also updates automatically as you change the date inputs.

Currently, filtering is primarily available by date range.

## 7. General Navigation

This application uses a main navigation menu (often a sidebar or a top bar) to help you move between different sections.

### 7.1. Using the Main Menu

*   **Locating the Menu:** Look for a navigation bar, typically located at the top or on the left side of the screen.
*   **Navigating:** Click on the menu items to go to the respective pages, such as:
    *   Dashboard/Home
    *   Categories
    *   Products
    *   Customers
    *   POS (Point of Sale)
    *   Sales Reports
    *   *(Note: A User Profile/Settings link might also be available once implemented).*
*   **Active Section:** The currently active section may be highlighted in the navigation menu to help you identify where you are in the application.

*(This section is general as the navigation component (`Navbar.jsx`) hasn't been built yet. It provides a basic idea of how to move around the app once the navbar is in place.)*
```
