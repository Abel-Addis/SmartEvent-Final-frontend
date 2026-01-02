import * as yup from "yup";

// Event creation step 1 validation schema
export const eventSchema = yup.object({
  title: yup
    .string()
    .required("Event title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),

  description: yup
    .string()
    .required("Description is required")
    .nullable()
    .max(5000, "Description must not exceed 5000 characters"),

  categoryId: yup.string().required("Please select a category"),

  venue: yup
    .string()
    .required("Venue is required")
    .nullable()
    .max(200, "Venue name must not exceed 200 characters"),

  location: yup
    .string()
    .required("Location is required")
    .max(500, "Location must not exceed 500 characters"),

  ticketSalesStart: yup
    .date()
    .required("Ticket sales start date is required")
    .min(new Date(), "Ticket sales start date must be in the future"),

  ticketSalesEnd: yup
    .date()
    .required("Ticket sales end date is required")
    .min(
      yup.ref("ticketSalesStart"),
      "Ticket sales end date must be after ticket sales start date"
    ),

  startDate: yup
    .date()
    .required("Event start date is required")
    .min(
      yup.ref("ticketSalesStart"),
      "Event start date must be after ticket sales start"
    ),

  endDate: yup
    .date()
    .required("Event end date is required")
    .min(yup.ref("startDate"), "Event end date must be after start date"),

  totalCapacity: yup
    .number()
    .required("Total capacity is required")
    .min(1, "Capacity must be at least 1")
    .max(1000000, "Capacity seems unrealistic"),

  coverImage: yup
    .mixed()
    .required("Cover image is required")
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value || !(value instanceof File)) return true; // checking if it's a file object
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value || !(value instanceof File)) return true;
      return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        value.type
      );
    }),
});

// Ticket validation schema (Step 2)
export const ticketSchema = yup.object({
  tickets: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("Ticket name is required"),
        description: yup.string().required("Ticket description is required"),
        basePrice: yup
          .number()
          .required("Price is required")
          .min(0, "Price cannot be negative"),
        quantity: yup
          .number()
          .required("Quantity is required")
          .min(1, "At least 1 ticket required"),
      })
    )
    .min(1, "At least one ticket type is required"),
});
