/* =========================================================
   MESSMATE - SMART MESS MANAGEMENT
   Complete Frontend CRUD + Search + Reporting + Business Rules
========================================================= */


/* =========================================================
   API ENDPOINTS
========================================================= */

const API = {

    residents: "/api/residents",

    menuItems: "/api/menu-items",

    meals: "/api/meals",

    optOuts: "/api/meal-opt-outs",

    feedback: "/api/feedback"

};


/* =========================================================
   APPLICATION SETTINGS
========================================================= */

const LOW_RATING_THRESHOLD = 3;

const WEEK_START_DAY = 1;


/* =========================================================
   EDIT STATES
========================================================= */

let residentEditId = null;

let menuEditId = null;

let optOutEditId = null;

let feedbackEditId = null;


/* =========================================================
   FEEDBACK SEARCH STATE
========================================================= */

let feedbackSearchActive = false;


/* =========================================================
   REPORT DATA CACHE
========================================================= */

let reportData = {

    residents: [],

    menus: [],

    meals: [],

    optOuts: [],

    feedback: []

};


/* =========================================================
   APPLICATION START
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    createReportingPanel();

    initializeFeedbackSearch();

    await Promise.allSettled([

        loadResidents(),

        loadMenus(),

        loadMeals(),

        loadOptOuts(),

        loadFeedback()

    ]);

    await checkBackend();

    await updateDashboard();

    prepareDefaultWeek();

});


/* =========================================================
   COMMON FUNCTIONS
========================================================= */

function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add("active");

    }


    const navButton =
        document.querySelector(
            `.nav-item[data-section="${sectionId}"]`
        );


    if (navButton) {

        navButton.classList.add("active");

    }


    const pageTitle =
        document.getElementById("pageTitle");


    const titles = {

        dashboard: "Dashboard",

        residents: "Residents",

        menu: "Weekly Menu",

        meals: "Meals",

        optout: "Meal Opt-Out",

        feedback: "Meal Feedback"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionId] || "Dashboard";

    }


    if (sectionId === "dashboard") {

        updateDashboard();

        updateWeeklyReport();

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    if (!toast) {

        return;

    }


    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================================
   ERROR HANDLING
========================================================= */

async function getErrorMessage(response) {

    try {

        const data =
            await response.json();


        if (data.errors) {

            if (typeof data.errors === "object") {

                return Object
                    .values(data.errors)
                    .join(", ");

            }

            return data.errors;

        }


        if (data.message) {

            return data.message;

        }


        if (data.detail) {

            return data.detail;

        }


        if (data.error) {

            return data.error;

        }


        return "Something went wrong.";

    }

    catch {

        try {

            const text =
                await response.text();


            return text ||
                `Request failed with status ${response.status}`;

        }

        catch {

            return `Request failed with status ${response.status}`;

        }

    }

}


/* =========================================================
   GENERIC API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {

    const response =
        await fetch(url, {

            ...options,

            headers: {

                ...(options.body
                    ? {
                        "Content-Type":
                            "application/json"
                    }
                    : {}),

                ...(options.headers || {})

            }

        });


    if (!response.ok) {

        throw new Error(
            await getErrorMessage(response)
        );

    }


    if (response.status === 204) {

        return null;

    }


    const text =
        await response.text();


    if (!text) {

        return null;

    }


    try {

        return JSON.parse(text);

    }

    catch {

        return text;

    }

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   NUMBER VALIDATION
========================================================= */

function isPositiveNumber(value) {

    return (

        value !== "" &&

        Number.isFinite(
            Number(value)
        ) &&

        Number(value) > 0

    );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function parseDateOnly(dateString) {

    if (!dateString) {

        return null;

    }


    const parts =
        String(dateString).split("-");


    if (parts.length !== 3) {

        return null;

    }


    return new Date(

        Number(parts[0]),

        Number(parts[1]) - 1,

        Number(parts[2])

    );

}


function formatDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function getMonday(date) {

    const result =
        new Date(date);


    const day =
        result.getDay();


    const difference =
        day === 0
            ? -6
            : WEEK_START_DAY - day;


    result.setDate(
        result.getDate() + difference
    );


    return result;

}


function getSunday(date) {

    const monday =
        getMonday(date);


    const sunday =
        new Date(monday);


    sunday.setDate(
        sunday.getDate() + 6
    );


    return sunday;

}


/* =========================================================
   BACKEND CHECK
========================================================= */

async function checkBackend() {

    const status =
        document.getElementById(
            "systemStatus"
        );


    if (!status) {

        return;

    }


    try {

        const response =
            await fetch(API.residents);


        if (response.ok) {

            status.textContent =
                "🟢 Backend connected successfully";

        }

        else {

            status.textContent =
                "🟠 Backend responded with an error";

        }

    }

    catch {

        status.textContent =
            "🔴 Backend is not reachable";

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard() {

    try {

        const [

            residents,

            menus,

            meals,

            feedback

        ] = await Promise.all([

            apiRequest(API.residents),

            apiRequest(API.menuItems),

            apiRequest(API.meals),

            apiRequest(API.feedback)

        ]);


        reportData.residents =
            Array.isArray(residents)
                ? residents
                : [];


        reportData.menus =
            Array.isArray(menus)
                ? menus
                : [];


        reportData.meals =
            Array.isArray(meals)
                ? meals
                : [];


        reportData.feedback =
            Array.isArray(feedback)
                ? feedback
                : [];


        setElementText(
            "residentCount",
            reportData.residents.length
        );


        setElementText(
            "menuCount",
            reportData.menus.length
        );


        setElementText(
            "mealCount",
            reportData.meals.length
        );


        setElementText(
            "feedbackCount",
            reportData.feedback.length
        );


        updateWeeklyReport();

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


/* =========================================================
   SET ELEMENT TEXT
========================================================= */

function setElementText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}


/* =========================================================
   RESIDENT CRUD
========================================================= */

async function loadResidents() {

    try {

        const residents =
            await apiRequest(
                API.residents
            );


        reportData.residents =
            Array.isArray(residents)
                ? residents
                : [];


        renderResidents(
            reportData.residents
        );


        setElementText(
            "residentCount",
            reportData.residents.length
        );

    }

    catch (error) {

        console.error(
            "Resident loading error:",
            error
        );

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   RENDER RESIDENTS
--------------------------------------------------------- */

function renderResidents(residents) {

    const tbody =
        document.getElementById(
            "residentTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !residents ||
        residents.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4" class="empty">

                    No residents found

                </td>

            </tr>

        `;


        return;

    }


    residents.forEach(resident => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHtml(resident.id)}</td>

            <td>${escapeHtml(resident.name)}</td>

            <td>${escapeHtml(resident.roomNumber)}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editResident(${resident.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteResident(${resident.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* ---------------------------------------------------------
   SAVE RESIDENT
--------------------------------------------------------- */

async function saveResident() {

    const id =
        document.getElementById(
            "residentId"
        ).value.trim();


    const name =
        document.getElementById(
            "residentName"
        ).value.trim();


    const roomNumber =
        document.getElementById(
            "residentRoom"
        ).value.trim();


    if (!id) {

        showToast(
            "Please enter Resident ID."
        );

        return;

    }


    if (!isPositiveNumber(id)) {

        showToast(
            "Resident ID must be greater than 0."
        );

        return;

    }


    if (!name) {

        showToast(
            "Please enter resident name."
        );

        return;

    }


    if (!roomNumber) {

        showToast(
            "Please enter room number."
        );

        return;

    }


    const resident = {

        id: Number(id),

        name: name,

        roomNumber: roomNumber

    };


    try {

        if (residentEditId !== null) {

            await apiRequest(

                `${API.residents}/${residentEditId}`,

                {

                    method: "PUT",

                    body:
                        JSON.stringify(resident)

                }

            );


            showToast(
                "Resident updated successfully"
            );

        }

        else {

            await apiRequest(

                API.residents,

                {

                    method: "POST",

                    body:
                        JSON.stringify(resident)

                }

            );


            showToast(
                "Resident added successfully"
            );

        }


        clearResidentForm();

        await loadResidents();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   EDIT RESIDENT
--------------------------------------------------------- */

async function editResident(id) {

    try {

        const resident =
            await apiRequest(
                `${API.residents}/${id}`
            );


        document.getElementById(
            "residentId"
        ).value =
            resident.id;


        document.getElementById(
            "residentName"
        ).value =
            resident.name;


        document.getElementById(
            "residentRoom"
        ).value =
            resident.roomNumber;


        residentEditId =
            resident.id;


        document.getElementById(
            "residentId"
        ).readOnly = true;


        showSection("residents");


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   DELETE RESIDENT
--------------------------------------------------------- */

async function deleteResident(id) {

    if (!confirm(
        `Delete resident with ID ${id}?`
    )) {

        return;

    }


    try {

        await apiRequest(

            `${API.residents}/${id}`,

            {

                method: "DELETE"

            }

        );


        showToast(
            "Resident deleted successfully"
        );


        if (residentEditId === id) {

            clearResidentForm();

        }


        await loadResidents();

        await loadOptOuts();

        await loadFeedback();

        clearFeedbackSearch();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   CLEAR RESIDENT
--------------------------------------------------------- */

function clearResidentForm() {

    document.getElementById(
        "residentId"
    ).value = "";


    document.getElementById(
        "residentName"
    ).value = "";


    document.getElementById(
        "residentRoom"
    ).value = "";


    residentEditId = null;


    document.getElementById(
        "residentId"
    ).readOnly = false;

}


/* =========================================================
   MENU CRUD
========================================================= */

async function loadMenus() {

    try {

        const menus =
            await apiRequest(
                API.menuItems
            );


        reportData.menus =
            Array.isArray(menus)
                ? menus
                : [];


        renderMenus(
            reportData.menus
        );


        setElementText(
            "menuCount",
            reportData.menus.length
        );

    }

    catch (error) {

        console.error(
            "Menu loading error:",
            error
        );

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   RENDER MENUS
--------------------------------------------------------- */

function renderMenus(menus) {

    const tbody =
        document.getElementById(
            "menuTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !menus ||
        menus.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4" class="empty">

                    No menus found

                </td>

            </tr>

        `;


        return;

    }


    menus.forEach(menu => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHtml(menu.id)}</td>

            <td>${escapeHtml(menu.weekStartDate)}</td>

            <td>${escapeHtml(menu.weekEndDate)}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editMenu(${menu.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteMenu(${menu.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* ---------------------------------------------------------
   SAVE MENU
--------------------------------------------------------- */

async function saveMenu() {

    const id =
        document.getElementById(
            "menuId"
        ).value.trim();


    const weekStartDate =
        document.getElementById(
            "weekStartDate"
        ).value;


    const weekEndDate =
        document.getElementById(
            "weekEndDate"
        ).value;


    if (!id) {

        showToast(
            "Please enter Menu ID."
        );

        return;

    }


    if (!isPositiveNumber(id)) {

        showToast(
            "Menu ID must be greater than 0."
        );

        return;

    }


    if (
        !weekStartDate ||
        !weekEndDate
    ) {

        showToast(
            "Please select both dates."
        );

        return;

    }


    if (weekStartDate > weekEndDate) {

        showToast(
            "Week start date cannot be after week end date."
        );

        return;

    }


    const menu = {

        id: Number(id),

        weekStartDate,

        weekEndDate

    };


    try {

        if (menuEditId !== null) {

            await apiRequest(

                `${API.menuItems}/${menuEditId}`,

                {

                    method: "PUT",

                    body:
                        JSON.stringify(menu)

                }

            );


            showToast(
                "Menu updated successfully"
            );

        }

        else {

            await apiRequest(

                API.menuItems,

                {

                    method: "POST",

                    body:
                        JSON.stringify(menu)

                }

            );


            showToast(
                "Menu added successfully"
            );

        }


        clearMenuForm();

        await loadMenus();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   EDIT MENU
--------------------------------------------------------- */

async function editMenu(id) {

    try {

        const menu =
            await apiRequest(
                `${API.menuItems}/${id}`
            );


        document.getElementById(
            "menuId"
        ).value =
            menu.id;


        document.getElementById(
            "weekStartDate"
        ).value =
            menu.weekStartDate;


        document.getElementById(
            "weekEndDate"
        ).value =
            menu.weekEndDate;


        menuEditId =
            menu.id;


        document.getElementById(
            "menuId"
        ).readOnly = true;


        showSection("menu");


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   DELETE MENU
--------------------------------------------------------- */

async function deleteMenu(id) {

    if (!confirm(
        `Delete menu with ID ${id}?`
    )) {

        return;

    }


    try {

        await apiRequest(

            `${API.menuItems}/${id}`,

            {

                method: "DELETE"

            }

        );


        showToast(
            "Menu deleted successfully"
        );


        if (menuEditId === id) {

            clearMenuForm();

        }


        await loadMenus();

        await loadMeals();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   CLEAR MENU
--------------------------------------------------------- */

function clearMenuForm() {

    document.getElementById(
        "menuId"
    ).value = "";


    document.getElementById(
        "weekStartDate"
    ).value = "";


    document.getElementById(
        "weekEndDate"
    ).value = "";


    menuEditId = null;


    document.getElementById(
        "menuId"
    ).readOnly = false;

}


/* =========================================================
   MEAL CRUD
========================================================= */

async function loadMeals() {

    try {

        const meals =
            await apiRequest(
                API.meals
            );


        reportData.meals =
            Array.isArray(meals)
                ? meals
                : [];


        renderMeals(
            reportData.meals
        );


        setElementText(
            "mealCount",
            reportData.meals.length
        );

    }

    catch (error) {

        console.error(
            "Meal loading error:",
            error
        );

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   RENDER MEALS
--------------------------------------------------------- */

function renderMeals(meals) {

    const tbody =
        document.getElementById(
            "mealTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !meals ||
        meals.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6" class="empty">

                    No meals found

                </td>

            </tr>

        `;


        return;

    }


    meals.forEach(meal => {

        const menuId =
            meal.menuItem?.id ?? "-";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHtml(meal.id)}</td>

            <td>${escapeHtml(meal.mealDate)}</td>

            <td>${escapeHtml(meal.mealType)}</td>

            <td>${escapeHtml(meal.description)}</td>

            <td>${escapeHtml(menuId)}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editMeal(${meal.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteMeal(${meal.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* ---------------------------------------------------------
   SAVE MEAL
--------------------------------------------------------- */

async function saveMeal() {

    const id =
        document.getElementById(
            "mealId"
        ).value;


    const mealDate =
        document.getElementById(
            "mealDate"
        ).value;


    const mealType =
        document.getElementById(
            "mealType"
        ).value;


    const description =
        document.getElementById(
            "mealDescription"
        ).value.trim();


    const menuItemId =
        document.getElementById(
            "mealMenuItemId"
        ).value;


    if (
        !mealDate ||
        !mealType ||
        !description ||
        !menuItemId
    ) {

        showToast(
            "Fill all meal fields."
        );

        return;

    }


    if (!isPositiveNumber(menuItemId)) {

        showToast(
            "Menu ID must be greater than 0."
        );

        return;

    }


    const duplicateMeal =
        reportData.meals.some(meal => {

            return (

                String(meal.mealDate) ===
                String(mealDate)

                &&

                String(meal.mealType)
                    .toUpperCase() ===
                String(mealType)
                    .toUpperCase()

                &&

                String(meal.id) !==
                String(id || "")

            );

        });


    if (duplicateMeal) {

        showToast(
            `${mealType} already exists for ${mealDate}.`
        );

        return;

    }


    const meal = {

        mealDate,

        mealType,

        description,

        menuItem: {

            id: Number(menuItemId)

        }

    };


    try {

        if (id) {

            await apiRequest(

                `${API.meals}/${id}`,

                {

                    method: "PUT",

                    body:
                        JSON.stringify(meal)

                }

            );


            showToast(
                "Meal updated successfully"
            );

        }

        else {

            await apiRequest(

                API.meals,

                {

                    method: "POST",

                    body:
                        JSON.stringify(meal)

                }

            );


            showToast(
                "Meal added successfully"
            );

        }


        clearMealForm();

        await loadMeals();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   EDIT MEAL
--------------------------------------------------------- */

async function editMeal(id) {

    try {

        const meal =
            await apiRequest(
                `${API.meals}/${id}`
            );


        document.getElementById(
            "mealId"
        ).value =
            meal.id;


        document.getElementById(
            "mealDate"
        ).value =
            meal.mealDate;


        document.getElementById(
            "mealType"
        ).value =
            meal.mealType;


        document.getElementById(
            "mealDescription"
        ).value =
            meal.description;


        document.getElementById(
            "mealMenuItemId"
        ).value =
            meal.menuItem?.id || "";


        showSection("meals");


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   DELETE MEAL
--------------------------------------------------------- */

async function deleteMeal(id) {

    if (!confirm(
        `Delete meal with ID ${id}?`
    )) {

        return;

    }


    try {

        await apiRequest(

            `${API.meals}/${id}`,

            {

                method: "DELETE"

            }

        );


        showToast(
            "Meal deleted successfully"
        );


        await loadMeals();

        await loadFeedback();

        clearFeedbackSearch();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   CLEAR MEAL
--------------------------------------------------------- */

function clearMealForm() {

    document.getElementById(
        "mealId"
    ).value = "";


    document.getElementById(
        "mealDate"
    ).value = "";


    document.getElementById(
        "mealType"
    ).value = "";


    document.getElementById(
        "mealDescription"
    ).value = "";


    document.getElementById(
        "mealMenuItemId"
    ).value = "";

}


/* =========================================================
   MEAL OPT-OUT CRUD
========================================================= */

async function loadOptOuts() {

    try {

        const records =
            await apiRequest(
                API.optOuts
            );


        reportData.optOuts =
            Array.isArray(records)
                ? records
                : [];


        renderOptOuts(
            reportData.optOuts
        );

    }

    catch (error) {

        console.error(
            "Opt-out loading error:",
            error
        );

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   RENDER OPT-OUTS
--------------------------------------------------------- */

function renderOptOuts(records) {

    const tbody =
        document.getElementById(
            "optOutTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !records ||
        records.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5" class="empty">

                    No opt-out records

                </td>

            </tr>

        `;


        return;

    }


    records.forEach(record => {

        const residentId =
            record.resident?.id ?? "-";


        const residentName =
            record.resident?.name ?? "-";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHtml(record.id)}</td>

            <td>${escapeHtml(residentId)}</td>

            <td>${escapeHtml(residentName)}</td>

            <td>${escapeHtml(record.optOutDate)}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editOptOut(${record.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteOptOut(${record.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* ---------------------------------------------------------
   SAVE OPT-OUT
--------------------------------------------------------- */

async function saveOptOut() {

    const residentId =
        document.getElementById(
            "optOutResidentId"
        ).value;


    const optOutDate =
        document.getElementById(
            "optOutDate"
        ).value;


    if (
        !residentId ||
        !optOutDate
    ) {

        showToast(
            "Enter resident ID and date."
        );

        return;

    }


    if (!isPositiveNumber(residentId)) {

        showToast(
            "Resident ID must be greater than 0."
        );

        return;

    }


    if (optOutEditId === null) {

        const residentExists =
            reportData.residents.some(
                resident =>
                    Number(resident.id) ===
                    Number(residentId)
            );


        if (!residentExists) {

            showToast(
                "Resident ID does not exist."
            );

            return;

        }


        const duplicate =
            reportData.optOuts.some(record => {

                return (

                    Number(record.resident?.id) ===
                    Number(residentId)

                    &&

                    String(record.optOutDate) ===
                    String(optOutDate)

                );

            });


        if (duplicate) {

            showToast(
                "This resident has already opted out for this date."
            );

            return;

        }

    }


    const optOut = {

        resident: {

            id: Number(residentId)

        },

        optOutDate

    };


    try {

        if (optOutEditId !== null) {

            await apiRequest(

                `${API.optOuts}/${optOutEditId}`,

                {

                    method: "PUT",

                    body: JSON.stringify({

                        optOutDate

                    })

                }

            );


            showToast(
                "Meal opt-out updated successfully"
            );

        }

        else {

            await apiRequest(

                API.optOuts,

                {

                    method: "POST",

                    body:
                        JSON.stringify(optOut)

                }

            );


            showToast(
                "Meal opt-out submitted successfully"
            );

        }


        clearOptOutForm();

        await loadOptOuts();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   EDIT OPT-OUT
--------------------------------------------------------- */

async function editOptOut(id) {

    try {

        const record =
            await apiRequest(
                `${API.optOuts}/${id}`
            );


        document.getElementById(
            "optOutResidentId"
        ).value =
            record.resident?.id || "";


        document.getElementById(
            "optOutDate"
        ).value =
            record.optOutDate || "";


        optOutEditId = id;


        const button =
            document.querySelector(
                "#optout button.primary"
            );


        if (button) {

            button.textContent =
                "Update Opt-Out";

        }


        showSection("optout");


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   DELETE OPT-OUT
--------------------------------------------------------- */

async function deleteOptOut(id) {

    if (!confirm(
        "Delete this opt-out record?"
    )) {

        return;

    }


    try {

        await apiRequest(

            `${API.optOuts}/${id}`,

            {

                method: "DELETE"

            }

        );


        showToast(
            "Opt-out deleted successfully"
        );


        await loadOptOuts();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   CLEAR OPT-OUT
--------------------------------------------------------- */

function clearOptOutForm() {

    document.getElementById(
        "optOutResidentId"
    ).value = "";


    document.getElementById(
        "optOutDate"
    ).value = "";


    optOutEditId = null;


    const button =
        document.querySelector(
            "#optout button.primary"
        );


    if (button) {

        button.textContent =
            "Submit Opt-Out";

    }

}


/* =========================================================
   FEEDBACK CRUD
========================================================= */

async function loadFeedback() {

    try {

        const feedback =
            await apiRequest(
                API.feedback
            );


        reportData.feedback =
            Array.isArray(feedback)
                ? feedback
                : [];


        /*
         * If a search is currently active,
         * keep the search result visible.
         */
        if (feedbackSearchActive) {

            performFeedbackSearch(false);

        }

        else {

            renderFeedback(
                reportData.feedback
            );

        }


        setElementText(
            "feedbackCount",
            reportData.feedback.length
        );

    }

    catch (error) {

        console.error(
            "Feedback loading error:",
            error
        );

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   RENDER FEEDBACK
--------------------------------------------------------- */

function renderFeedback(feedbackList) {

    const tbody =
        document.getElementById(
            "feedbackTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !feedbackList ||
        feedbackList.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7" class="empty">

                    No feedback found

                </td>

            </tr>

        `;


        return;

    }


    feedbackList.forEach(feedback => {

        const residentId =
            feedback.resident?.id ?? "-";


        const mealId =
            feedback.meal?.id ?? "-";


        const numericRating =
            Number(feedback.rating);


        const rating =
            numericRating >= 1 &&
            numericRating <= 5

                ? "⭐".repeat(numericRating)

                : "-";


        const createdAt =
            feedback.createdAt

                ? new Date(
                    feedback.createdAt
                ).toLocaleString()

                : "-";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHtml(feedback.id)}</td>

            <td>${escapeHtml(residentId)}</td>

            <td>${escapeHtml(mealId)}</td>

            <td>${rating}</td>

            <td>${escapeHtml(feedback.comment)}</td>

            <td>${escapeHtml(createdAt)}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editFeedback(${feedback.id})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteFeedback(${feedback.id})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   FEEDBACK SEARCH
========================================================= */


/*
 * Finds an element using multiple possible IDs.
 *
 * This makes the search compatible with different
 * versions of the HTML.
 */
function findFeedbackSearchElement(ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);


        if (element) {

            return element;

        }

    }


    return null;

}


/* ---------------------------------------------------------
   INITIALIZE FEEDBACK SEARCH
--------------------------------------------------------- */

function initializeFeedbackSearch() {

    /*
     * Possible IDs used by the search fields.
     */
    const residentInput =
        findFeedbackSearchElement([

            "searchResidentId",

            "feedbackSearchResidentId",

            "feedbackSearchResident",

            "searchFeedbackResidentId",

            "searchFeedbackResident"

        ]);


    const mealInput =
        findFeedbackSearchElement([

            "searchMealId",

            "feedbackSearchMealId",

            "feedbackSearchMeal",

            "searchFeedbackMealId",

            "searchFeedbackMeal"

        ]);


    const ratingInput =
        findFeedbackSearchElement([

            "searchRating",

            "feedbackSearchRating",

            "searchFeedbackRating"

        ]);


    /*
     * If the search controls are not present,
     * don't interrupt the rest of the application.
     */
    if (
        !residentInput &&
        !mealInput &&
        !ratingInput
    ) {

        /*
         * Try to locate the feedback search card
         * by searching its visible heading.
         */
        const feedbackSection =
            document.getElementById("feedback");


        if (!feedbackSection) {

            return;

        }


        const allElements =
            feedbackSection.querySelectorAll(
                "input, select"
            );


        allElements.forEach(element => {

            const placeholder =
                (
                    element.placeholder ||
                    ""
                ).toLowerCase();


            const name =
                (
                    element.name ||
                    ""
                ).toLowerCase();


            const id =
                (
                    element.id ||
                    ""
                ).toLowerCase();


            if (
                !residentInput &&
                (
                    placeholder.includes("resident") ||
                    name.includes("resident") ||
                    id.includes("resident")
                )
            ) {

                /*
                 * Nothing to do here because
                 * residentInput is const.
                 */

            }

        });

    }


    addFeedbackSearchButton(
        residentInput,
        mealInput,
        ratingInput
    );


    /*
     * Pressing Enter in a search field
     * also performs the search.
     */
    [
        residentInput,
        mealInput,
        ratingInput
    ]
        .filter(Boolean)
        .forEach(input => {

            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        performFeedbackSearch();

                    }

                }
            );

        });

}


/* ---------------------------------------------------------
   ADD SEARCH BUTTON
--------------------------------------------------------- */

function addFeedbackSearchButton(
    residentInput,
    mealInput,
    ratingInput
) {

    /*
     * Don't create duplicate buttons.
     */
    if (
        document.getElementById(
            "feedbackSearchButton"
        )
    ) {

        return;

    }


    /*
     * Locate the feedback section.
     */
    const feedbackSection =
        document.getElementById(
            "feedback"
        );


    if (!feedbackSection) {

        return;

    }


    /*
     * Find the card containing the search fields.
     */
    let searchCard =
        null;


    if (residentInput) {

        searchCard =
            residentInput.closest(
                ".form-card, .search-card, .card"
            );

    }


    if (!searchCard && mealInput) {

        searchCard =
            mealInput.closest(
                ".form-card, .search-card, .card"
            );

    }


    if (!searchCard && ratingInput) {

        searchCard =
            ratingInput.closest(
                ".form-card, .search-card, .card"
            );

    }


    /*
     * If we cannot identify the card,
     * use the feedback section itself.
     */
    if (!searchCard) {

        searchCard =
            feedbackSection;

    }


    const buttonContainer =
        document.createElement("div");


    buttonContainer.id =
        "feedbackSearchButtons";


    buttonContainer.style.display =
        "flex";


    buttonContainer.style.gap =
        "10px";


    buttonContainer.style.flexWrap =
        "wrap";


    buttonContainer.style.marginTop =
        "15px";


    buttonContainer.innerHTML = `

        <button
            type="button"
            id="feedbackSearchButton"
            class="primary">

            🔍 Search Feedback

        </button>


        <button
            type="button"
            id="feedbackClearSearchButton"
            class="secondary">

            ✕ Clear Search

        </button>

    `;


    /*
     * Put the buttons at the bottom of
     * the search card.
     */
    searchCard.appendChild(
        buttonContainer
    );


    const searchButton =
        document.getElementById(
            "feedbackSearchButton"
        );


    const clearButton =
        document.getElementById(
            "feedbackClearSearchButton"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                performFeedbackSearch();

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                clearFeedbackSearch();

            }
        );

    }

}


/* ---------------------------------------------------------
   GET SEARCH INPUTS
--------------------------------------------------------- */

function getFeedbackSearchValues() {

    const residentInput =
        findFeedbackSearchElement([

            "searchResidentId",

            "feedbackSearchResidentId",

            "feedbackSearchResident",

            "searchFeedbackResidentId",

            "searchFeedbackResident"

        ]);


    const mealInput =
        findFeedbackSearchElement([

            "searchMealId",

            "feedbackSearchMealId",

            "feedbackSearchMeal",

            "searchFeedbackMealId",

            "searchFeedbackMeal"

        ]);


    const ratingInput =
        findFeedbackSearchElement([

            "searchRating",

            "feedbackSearchRating",

            "searchFeedbackRating"

        ]);


    return {

        residentId:
            residentInput
                ? residentInput.value.trim()
                : "",

        mealId:
            mealInput
                ? mealInput.value.trim()
                : "",

        rating:
            ratingInput
                ? ratingInput.value.trim()
                : ""

    };

}


/* ---------------------------------------------------------
   PERFORM FEEDBACK SEARCH
--------------------------------------------------------- */

function performFeedbackSearch(
    showMessage = true
) {

    const {

        residentId,

        mealId,

        rating

    } = getFeedbackSearchValues();


    /*
     * If no filters are entered,
     * show all feedback.
     */
    if (
        !residentId &&
        !mealId &&
        !rating
    ) {

        feedbackSearchActive = false;

        renderFeedback(
            reportData.feedback
        );


        if (showMessage) {

            showToast(
                "Showing all feedback."
            );

        }


        return;

    }


    /*
     * Validate Resident ID.
     */
    if (
        residentId &&
        !isPositiveNumber(residentId)
    ) {

        showToast(
            "Resident ID must be greater than 0."
        );

        return;

    }


    /*
     * Validate Meal ID.
     */
    if (
        mealId &&
        !isPositiveNumber(mealId)
    ) {

        showToast(
            "Meal ID must be greater than 0."
        );

        return;

    }


    /*
     * Validate Rating.
     */
    if (
        rating &&
        rating !== "all" &&
        (
            Number(rating) < 1 ||
            Number(rating) > 5
        )
    ) {

        showToast(
            "Rating must be between 1 and 5."
        );

        return;

    }


    feedbackSearchActive = true;


    const filteredFeedback =
        reportData.feedback.filter(
            feedback => {

                const feedbackResidentId =
                    String(
                        feedback.resident?.id ?? ""
                    );


                const feedbackMealId =
                    String(
                        feedback.meal?.id ?? ""
                    );


                const feedbackRating =
                    String(
                        feedback.rating ?? ""
                    );


                const residentMatches =
                    !residentId ||
                    feedbackResidentId ===
                    String(residentId);


                const mealMatches =
                    !mealId ||
                    feedbackMealId ===
                    String(mealId);


                const ratingMatches =
                    !rating ||
                    rating === "all" ||
                    feedbackRating ===
                    String(rating);


                return (

                    residentMatches &&

                    mealMatches &&

                    ratingMatches

                );

            }
        );


    renderFeedback(
        filteredFeedback
    );


    if (showMessage) {

        showToast(

            `${filteredFeedback.length} feedback record(s) found.`

        );

    }

}


/* ---------------------------------------------------------
   CLEAR FEEDBACK SEARCH
--------------------------------------------------------- */

function clearFeedbackSearch() {

    const residentInput =
        findFeedbackSearchElement([

            "searchResidentId",

            "feedbackSearchResidentId",

            "feedbackSearchResident",

            "searchFeedbackResidentId",

            "searchFeedbackResident"

        ]);


    const mealInput =
        findFeedbackSearchElement([

            "searchMealId",

            "feedbackSearchMealId",

            "feedbackSearchMeal",

            "searchFeedbackMealId",

            "searchFeedbackMeal"

        ]);


    const ratingInput =
        findFeedbackSearchElement([

            "searchRating",

            "feedbackSearchRating",

            "searchFeedbackRating"

        ]);


    if (residentInput) {

        residentInput.value = "";

    }


    if (mealInput) {

        mealInput.value = "";

    }


    if (ratingInput) {

        ratingInput.value = "";

    }


    feedbackSearchActive = false;


    renderFeedback(
        reportData.feedback
    );

}


/* ---------------------------------------------------------
   SAVE FEEDBACK
--------------------------------------------------------- */

async function saveFeedback() {

    const residentId =
        document.getElementById(
            "feedbackResidentId"
        ).value;


    const mealId =
        document.getElementById(
            "feedbackMealId"
        ).value;


    const rating =
        document.getElementById(
            "feedbackRating"
        ).value;


    const comment =
        document.getElementById(
            "feedbackComment"
        ).value.trim();


    if (
        !residentId ||
        !mealId ||
        !rating ||
        !comment
    ) {

        showToast(
            "Fill all feedback fields."
        );

        return;

    }


    if (!isPositiveNumber(residentId)) {

        showToast(
            "Resident ID must be greater than 0."
        );

        return;

    }


    if (!isPositiveNumber(mealId)) {

        showToast(
            "Meal ID must be greater than 0."
        );

        return;

    }


    if (
        Number(rating) < 1 ||
        Number(rating) > 5
    ) {

        showToast(
            "Rating must be between 1 and 5."
        );

        return;

    }


    const residentExists =
        reportData.residents.some(
            resident =>
                Number(resident.id) ===
                Number(residentId)
        );


    if (!residentExists) {

        showToast(
            "Resident ID does not exist."
        );

        return;

    }


    const mealExists =
        reportData.meals.some(
            meal =>
                Number(meal.id) ===
                Number(mealId)
        );


    if (!mealExists) {

        showToast(
            "Meal ID does not exist."
        );

        return;

    }


    if (feedbackEditId === null) {

        const duplicateFeedback =
            reportData.feedback.some(
                feedback => {

                    return (

                        Number(
                            feedback.resident?.id
                        ) === Number(residentId)

                        &&

                        Number(
                            feedback.meal?.id
                        ) === Number(mealId)

                    );

                }
            );


        if (duplicateFeedback) {

            showToast(
                "This resident has already submitted feedback for this meal."
            );

            return;

        }

    }


    const feedback = {

        resident: {

            id: Number(residentId)

        },

        meal: {

            id: Number(mealId)

        },

        rating: Number(rating),

        comment

    };


    try {

        if (feedbackEditId !== null) {

            await apiRequest(

                `${API.feedback}/${feedbackEditId}`,

                {

                    method: "PUT",

                    body: JSON.stringify({

                        rating:
                            Number(rating),

                        comment

                    })

                }

            );


            showToast(
                "Feedback updated successfully"
            );

        }

        else {

            await apiRequest(

                API.feedback,

                {

                    method: "POST",

                    body:
                        JSON.stringify(feedback)

                }

            );


            showToast(
                "Feedback submitted successfully"
            );

        }


        clearFeedbackForm();

        clearFeedbackSearch();

        await loadFeedback();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   EDIT FEEDBACK
--------------------------------------------------------- */

async function editFeedback(id) {

    try {

        const feedback =
            await apiRequest(
                `${API.feedback}/${id}`
            );


        document.getElementById(
            "feedbackResidentId"
        ).value =
            feedback.resident?.id || "";


        document.getElementById(
            "feedbackMealId"
        ).value =
            feedback.meal?.id || "";


        document.getElementById(
            "feedbackRating"
        ).value =
            feedback.rating || "";


        document.getElementById(
            "feedbackComment"
        ).value =
            feedback.comment || "";


        feedbackEditId = id;


        document.getElementById(
            "feedbackResidentId"
        ).readOnly = true;


        document.getElementById(
            "feedbackMealId"
        ).readOnly = true;


        const button =
            document.querySelector(
                "#feedback button.primary"
            );


        if (button) {

            button.innerHTML =
                "<span>✦</span> Update Feedback";

        }


        showSection("feedback");


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   DELETE FEEDBACK
--------------------------------------------------------- */

async function deleteFeedback(id) {

    if (!confirm(
        "Delete this feedback?"
    )) {

        return;

    }


    try {

        await apiRequest(

            `${API.feedback}/${id}`,

            {

                method: "DELETE"

            }

        );


        showToast(
            "Feedback deleted successfully"
        );


        clearFeedbackSearch();

        await loadFeedback();

        await updateDashboard();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ---------------------------------------------------------
   CLEAR FEEDBACK FORM
--------------------------------------------------------- */

function clearFeedbackForm() {

    document.getElementById(
        "feedbackResidentId"
    ).value = "";


    document.getElementById(
        "feedbackMealId"
    ).value = "";


    document.getElementById(
        "feedbackRating"
    ).value = "";


    document.getElementById(
        "feedbackComment"
    ).value = "";


    feedbackEditId = null;


    document.getElementById(
        "feedbackResidentId"
    ).readOnly = false;


    document.getElementById(
        "feedbackMealId"
    ).readOnly = false;


    const button =
        document.querySelector(
            "#feedback button.primary"
        );


    if (button) {

        button.innerHTML =
            "<span>✦</span> Submit Feedback";

    }

}


/* =========================================================
   WEEKLY REPORTING
========================================================= */

function createReportingPanel() {

    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (!dashboard) {

        return;

    }


    if (
        document.getElementById(
            "weeklyReportPanel"
        )
    ) {

        return;

    }


    const panel =
        document.createElement("div");


    panel.id =
        "weeklyReportPanel";


    panel.className =
        "dashboard-card";


    panel.style.marginTop =
        "25px";


    panel.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:20px;
                flex-wrap:wrap;
                margin-bottom:20px;
            ">

            <div>

                <span
                    style="
                        font-size:12px;
                        font-weight:700;
                        letter-spacing:1px;
                        opacity:.65;
                    ">

                    WEEKLY ANALYTICS

                </span>

                <h2 style="margin-top:5px;">

                    Meal Rating Report

                </h2>

                <p style="margin-top:5px; opacity:.7;">

                    Average ratings and low-rated meals
                    with opted-out residents excluded.

                </p>

            </div>


            <div
                style="
                    display:flex;
                    align-items:end;
                    gap:10px;
                    flex-wrap:wrap;
                ">

                <div>

                    <label
                        for="reportWeekStart"
                        style="
                            display:block;
                            font-size:12px;
                            font-weight:600;
                            margin-bottom:5px;
                        ">

                        Week Start

                    </label>

                    <input
                        type="date"
                        id="reportWeekStart"
                        style="
                            padding:9px;
                            border:1px solid #d1d5db;
                            border-radius:8px;
                        ">

                </div>


                <button
                    class="primary"
                    onclick="updateWeeklyReport()"
                    style="height:40px;">

                    Generate Report

                </button>

            </div>

        </div>


        <div
            id="reportSummary"
            style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(180px,1fr));
                gap:15px;
                margin-bottom:25px;
            ">

        </div>


        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(320px,1fr));
                gap:20px;
            ">


            <div>

                <h3 style="margin-bottom:12px;">

                    Average Rating Per Meal

                </h3>


                <div style="overflow-x:auto;">

                    <table>

                        <thead>

                            <tr>

                                <th>Meal</th>

                                <th>Date</th>

                                <th>Type</th>

                                <th>Average</th>

                                <th>Feedback</th>

                            </tr>

                        </thead>


                        <tbody
                            id="averageMealTableBody">

                        </tbody>

                    </table>

                </div>

            </div>


            <div>

                <h3 style="margin-bottom:12px;">

                    Average Rating Per Day

                </h3>


                <div style="overflow-x:auto;">

                    <table>

                        <thead>

                            <tr>

                                <th>Date</th>

                                <th>Average</th>

                                <th>Feedback</th>

                            </tr>

                        </thead>


                        <tbody
                            id="averageDayTableBody">

                        </tbody>

                    </table>

                </div>

            </div>

        </div>


        <div style="margin-top:25px;">

            <h3 style="margin-bottom:12px;">

                Low-Rated Meals
                (Rating ≤ ${LOW_RATING_THRESHOLD})

            </h3>


            <div style="overflow-x:auto;">

                <table>

                    <thead>

                        <tr>

                            <th>Meal ID</th>

                            <th>Date</th>

                            <th>Type</th>

                            <th>Description</th>

                            <th>Average Rating</th>

                            <th>Feedback</th>

                        </tr>

                    </thead>


                    <tbody
                        id="lowRatedMealTableBody">

                    </tbody>

                </table>

            </div>

        </div>

    `;


    const infoCard =
        dashboard.querySelector(
            ".info-card"
        );


    if (infoCard) {

        infoCard.after(panel);

    }

    else {

        dashboard.appendChild(panel);

    }

}


/* =========================================================
   DEFAULT REPORT WEEK
========================================================= */

function prepareDefaultWeek() {

    const input =
        document.getElementById(
            "reportWeekStart"
        );


    if (!input) {

        return;

    }


    const monday =
        getMonday(
            new Date()
        );


    input.value =
        formatDate(monday);


    updateWeeklyReport();

}


/* =========================================================
   CHECK RESIDENT OPT-OUT
========================================================= */

function residentOptedOut(
    residentId,
    mealDate
) {

    return reportData.optOuts.some(
        record => {

            return (

                Number(
                    record.resident?.id
                ) === Number(residentId)

                &&

                String(
                    record.optOutDate
                ) === String(mealDate)

            );

        }
    );

}


/* =========================================================
   GET ELIGIBLE FEEDBACK
========================================================= */

function getEligibleFeedback() {

    return reportData.feedback.filter(
        feedback => {

            const residentId =
                feedback.resident?.id;


            const mealId =
                feedback.meal?.id;


            const meal =
                reportData.meals.find(
                    item =>
                        Number(item.id) ===
                        Number(mealId)
                );


            if (!meal) {

                return false;

            }


            if (!residentId) {

                return false;

            }


            if (
                residentOptedOut(
                    residentId,
                    meal.mealDate
                )
            ) {

                return false;

            }


            const rating =
                Number(feedback.rating);


            return (

                rating >= 1 &&

                rating <= 5

            );

        }
    );

}


/* =========================================================
   AVERAGE
========================================================= */

function calculateAverage(values) {

    if (
        !values ||
        values.length === 0
    ) {

        return null;

    }


    const total =
        values.reduce(
            (sum, value) =>
                sum + Number(value),
            0
        );


    return total / values.length;

}


/* =========================================================
   FORMAT RATING
========================================================= */

function formatRating(rating) {

    if (rating === null) {

        return "-";

    }


    return Number(rating)
        .toFixed(2);

}


/* =========================================================
   RATING STARS
========================================================= */

function ratingStars(rating) {

    if (rating === null) {

        return "-";

    }


    const rounded =
        Math.round(
            Number(rating)
        );


    return (

        "⭐".repeat(

            Math.max(

                0,

                Math.min(
                    5,
                    rounded
                )

            )

        )

        +

        ` ${Number(rating).toFixed(2)}`

    );

}


/* =========================================================
   UPDATE WEEKLY REPORT
========================================================= */

function updateWeeklyReport() {

    const weekInput =
        document.getElementById(
            "reportWeekStart"
        );


    if (!weekInput) {

        return;

    }


    let weekStart =
        parseDateOnly(
            weekInput.value
        );


    if (!weekStart) {

        weekStart =
            getMonday(
                new Date()
            );


        weekInput.value =
            formatDate(weekStart);

    }


    weekStart =
        getMonday(weekStart);


    weekInput.value =
        formatDate(weekStart);


    const weekEnd =
        getSunday(weekStart);


    const startString =
        formatDate(weekStart);


    const endString =
        formatDate(weekEnd);


    const weeklyMeals =
        reportData.meals.filter(
            meal => {

                return (

                    String(
                        meal.mealDate
                    ) >= startString

                    &&

                    String(
                        meal.mealDate
                    ) <= endString

                );

            }
        );


    const eligibleFeedback =
        getEligibleFeedback();


    const weeklyFeedback =
        eligibleFeedback.filter(
            feedback => {

                const meal =
                    reportData.meals.find(
                        item =>
                            Number(item.id) ===
                            Number(
                                feedback.meal?.id
                            )
                    );


                if (!meal) {

                    return false;

                }


                return (

                    String(
                        meal.mealDate
                    ) >= startString

                    &&

                    String(
                        meal.mealDate
                    ) <= endString

                );

            }
        );


    const mealAverages =
        buildMealAverages(
            weeklyMeals,
            weeklyFeedback
        );


    const dayAverages =
        buildDayAverages(
            weeklyMeals,
            weeklyFeedback
        );


    const lowRatedMeals =
        mealAverages.filter(
            item =>

                item.average !== null &&

                item.average <=
                LOW_RATING_THRESHOLD

        );


    renderReportSummary({

        weeklyMeals,

        weeklyFeedback,

        lowRatedMeals,

        startString,

        endString

    });


    renderAverageMealTable(
        mealAverages
    );


    renderAverageDayTable(
        dayAverages
    );


    renderLowRatedMeals(
        lowRatedMeals
    );

}


/* =========================================================
   BUILD MEAL AVERAGES
========================================================= */

function buildMealAverages(
    meals,
    feedbackList
) {

    return meals

        .map(meal => {

            const mealFeedback =
                feedbackList.filter(
                    feedback =>
                        Number(
                            feedback.meal?.id
                        ) === Number(meal.id)
                );


            const ratings =
                mealFeedback.map(
                    feedback =>
                        Number(
                            feedback.rating
                        )
                );


            return {

                mealId:
                meal.id,

                mealDate:
                meal.mealDate,

                mealType:
                meal.mealType,

                description:
                meal.description,

                average:
                    calculateAverage(
                        ratings
                    ),

                feedbackCount:
                ratings.length

            };

        })

        .sort((a, b) => {

            const dateCompare =
                String(a.mealDate)
                    .localeCompare(
                        String(b.mealDate)
                    );


            if (dateCompare !== 0) {

                return dateCompare;

            }


            return String(a.mealType)
                .localeCompare(
                    String(b.mealType)
                );

        });

}


/* =========================================================
   BUILD DAY AVERAGES
========================================================= */

function buildDayAverages(
    meals,
    feedbackList
) {

    const result = [];


    const dates =
        [
            ...new Set(

                meals.map(
                    meal =>
                        String(
                            meal.mealDate
                        )
                )

            )
        ];


    dates.sort();


    dates.forEach(date => {

        const dateFeedback =
            feedbackList.filter(
                feedback => {

                    const meal =
                        meals.find(
                            item =>
                                Number(item.id) ===
                                Number(
                                    feedback.meal?.id
                                )
                        );


                    return (

                        meal &&

                        String(
                            meal.mealDate
                        ) === date

                    );

                }
            );


        const ratings =
            dateFeedback.map(
                feedback =>
                    Number(
                        feedback.rating
                    )
            );


        result.push({

            date,

            average:
                calculateAverage(
                    ratings
                ),

            feedbackCount:
            ratings.length

        });

    });


    return result;

}


/* =========================================================
   REPORT SUMMARY
========================================================= */

function renderReportSummary(data) {

    const container =
        document.getElementById(
            "reportSummary"
        );


    if (!container) {

        return;

    }


    const average =
        calculateAverage(

            data.weeklyFeedback.map(
                feedback =>
                    Number(
                        feedback.rating
                    )
            )

        );


    const optedOutCount =
        reportData.optOuts.filter(
            record => {

                return (

                    String(
                        record.optOutDate
                    ) >= data.startString

                    &&

                    String(
                        record.optOutDate
                    ) <= data.endString

                );

            }
        ).length;


    container.innerHTML = `

        <div
            style="
                padding:16px;
                border-radius:10px;
                background:#f8fafc;
            ">

            <small>WEEK</small>

            <strong
                style="
                    display:block;
                    margin-top:5px;
                ">

                ${escapeHtml(data.startString)}
                →
                ${escapeHtml(data.endString)}

            </strong>

        </div>


        <div
            style="
                padding:16px;
                border-radius:10px;
                background:#f8fafc;
            ">

            <small>WEEKLY AVERAGE</small>

            <strong
                style="
                    display:block;
                    margin-top:5px;
                    font-size:22px;
                ">

                ${
        average === null
            ? "-"
            : formatRating(average)
    }

            </strong>

        </div>


        <div
            style="
                padding:16px;
                border-radius:10px;
                background:#f8fafc;
            ">

            <small>FEEDBACK USED</small>

            <strong
                style="
                    display:block;
                    margin-top:5px;
                    font-size:22px;
                ">

                ${data.weeklyFeedback.length}

            </strong>

        </div>


        <div
            style="
                padding:16px;
                border-radius:10px;
                background:#f8fafc;
            ">

            <small>LOW-RATED MEALS</small>

            <strong
                style="
                    display:block;
                    margin-top:5px;
                    font-size:22px;
                ">

                ${data.lowRatedMeals.length}

            </strong>

        </div>


        <div
            style="
                padding:16px;
                border-radius:10px;
                background:#f8fafc;
            ">

            <small>OPT-OUTS EXCLUDED</small>

            <strong
                style="
                    display:block;
                    margin-top:5px;
                    font-size:22px;
                ">

                ${optedOutCount}

            </strong>

        </div>

    `;

}


/* =========================================================
   AVERAGE PER MEAL TABLE
========================================================= */

function renderAverageMealTable(meals) {

    const tbody =
        document.getElementById(
            "averageMealTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !meals ||
        meals.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5" class="empty">

                    No meals available for this week.

                </td>

            </tr>

        `;


        return;

    }


    meals.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(item.mealId)}
            </td>

            <td>
                ${escapeHtml(item.mealDate)}
            </td>

            <td>
                ${escapeHtml(item.mealType)}
            </td>

            <td>
                ${escapeHtml(
            ratingStars(
                item.average
            )
        )}
            </td>

            <td>
                ${escapeHtml(
            item.feedbackCount
        )}
            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   AVERAGE PER DAY TABLE
========================================================= */

function renderAverageDayTable(days) {

    const tbody =
        document.getElementById(
            "averageDayTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !days ||
        days.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="3" class="empty">

                    No daily data available.

                </td>

            </tr>

        `;


        return;

    }


    days.forEach(day => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(day.date)}
            </td>

            <td>
                ${escapeHtml(
            ratingStars(
                day.average
            )
        )}
            </td>

            <td>
                ${escapeHtml(
            day.feedbackCount
        )}
            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   LOW-RATED MEALS TABLE
========================================================= */

function renderLowRatedMeals(meals) {

    const tbody =
        document.getElementById(
            "lowRatedMealTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !meals ||
        meals.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6" class="empty">

                    No low-rated meals found
                    for this week.

                </td>

            </tr>

        `;


        return;

    }


    meals.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(item.mealId)}
            </td>

            <td>
                ${escapeHtml(item.mealDate)}
            </td>

            <td>
                ${escapeHtml(item.mealType)}
            </td>

            <td>
                ${escapeHtml(item.description)}
            </td>

            <td>
                ${escapeHtml(
            ratingStars(
                item.average
            )
        )}
            </td>

            <td>
                ${escapeHtml(
            item.feedbackCount
        )}
            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   OPTIONAL GLOBAL REFRESH
========================================================= */

async function refreshAllData() {

    clearFeedbackSearch();


    await Promise.allSettled([

        loadResidents(),

        loadMenus(),

        loadMeals(),

        loadOptOuts(),

        loadFeedback()

    ]);


    await checkBackend();

    await updateDashboard();

    updateWeeklyReport();

}


/* =========================================================
   END OF MESSMATE SCRIPT
========================================================= */