import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: () => import("../views/Landing.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/auth/Login.vue"),
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("../views/auth/Signup.vue"),
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: () => import("../views/auth/VerifyEmail.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("../views/auth/ForgotPassword.vue"),
  },
  {
    path: "/dashboard",
    name: "AttendeeLayout",
    component: () => import("../layouts/AttendeeLayout.vue"),
    children: [
      {
        path: "",
        name: "AttendeeDashboard",
        component: () => import("../views/attendee/Dashboard.vue"),
      },
      {
        path: "events",
        name: "BrowseEvents",
        component: () => import("../views/attendee/BrowseEvents.vue"),
      },
      {
        path: "events/:id",
        name: "EventDetails",
        component: () => import("../views/attendee/EventDetails.vue"),
      },
      {
        path: "favorites",
        name: "Favorites",
        component: () => import("../views/attendee/Favorites.vue"),
      },
      {
        path: "checkout/:id",
        name: "Checkout",
        component: () => import("../views/attendee/Checkout.vue"),
      },
      {
        path: "payment/success",
        name: "PaymentSuccess",
        component: () => import("../views/attendee/PaymentSuccess.vue"),
      },
      {
        path: "tickets",
        name: "Tickets",
        component: () => import("../views/attendee/Tickets.vue"),
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("../views/attendee/Notifications.vue"),
      },
      {
        path: "settings",
        name: "AttendeeSettings",
        component: () => import("../views/attendee/Settings.vue"),
      },
    ],
  },
  {
    path: "/organizer",
    name: "OrganizerLayout",
    component: () => import("../layouts/OrganizerLayout.vue"),
    children: [
      {
        path: "",
        name: "OrganizerDashboard",
        component: () => import("../views/organizer/Dashboard.vue"),
      },
      {
        path: "create-event",
        name: "CreateEvent",
        component: () => import("../views/organizer/CreateEvent.vue"),
      },
      {
        path: "events/:id",
        name: "EventDetail",
        component: () => import("../views/organizer/EventDetail.vue"),
      },
      {
        path: "events/:id/edit",
        name: "EventEdit",
        component: () => import("../views/organizer/EventEdit.vue"),
      },
      {
        path: "events",
        name: "ManageEvents",
        component: () => import("../views/organizer/ManageEvents.vue"),
      },
      {
        path: "analytics",
        name: "Analytics",
        component: () => import("../views/organizer/Analytics.vue"),
      },
      {
        path: "gate-persons",
        name: "GatePersons",
        component: () => import("../views/organizer/GatePersons.vue"),
      },
      {
        path: "credits",
        name: "Credits",
        component: () => import("../views/organizer/Credits.vue"),
      },
      {
        path: "boosts",
        name: "BoostManagement",
        component: () => import("../views/organizer/BoostManagement.vue"),
      },
      {
        path: "notifications",
        name: "OrganizerNotifications",
        component: () => import("../views/organizer/Notifications.vue"),
      },
      {
        path: "settings",
        name: "OrganizerSettings",
        component: () => import("../views/organizer/Settings.vue"),
      },
    ],
  },
  {
    path: "/admin",
    name: "AdminLayout",
    component: () => import("../layouts/AdminLayout.vue"),
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("../views/admin/Dashboard.vue"),
      },
      {
        path: "users",
        name: "ManageUsers",
        component: () => import("../views/admin/Users.vue"),
      },
      {
        path: "organizers",
        name: "ManageOrganizers",
        component: () => import("../views/admin/Organizers.vue"),
      },
      {
        path: "events",
        name: "AdminEvents",
        component: () => import("../views/admin/Events.vue"),
      },
      {
        path: "categories",
        name: "Categories",
        component: () => import("../views/admin/Categories.vue"),
      },
      {
        path: "reports",
        name: "Reports",
        component: () => import("../views/admin/Reports.vue"),
      },
      {
        path: "notifications",
        name: "AdminNotifications",
        component: () => import("../views/admin/Notifications.vue"),
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../views/admin/Settings.vue"),
      },
    ],
  },
  {
    path: "/scanner",
    name: "GatePersonLayout",
    component: () => import("../layouts/GatePersonLayout.vue"),
    children: [
      {
        path: "",
        name: "GatePersonDashboard",
        component: () => import("../views/gateperson/Dashboard.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const publicPages = [
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/",
  ];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("authToken");

  if (authRequired && !loggedIn) {
    return next("/login");
  }

  next();
});

export default router;
