import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const signupSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
      "Invalid phone number"
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  // Organizer specific
  businessName: yup.string().when("userType", {
    is: "organizer",
    then: (schema) => schema.required("Business Name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessEmail: yup.string().when("userType", {
    is: "organizer",
    then: (schema) =>
      schema
        .email("Must be a valid email")
        .required("Business Email is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const gatePersonSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .test("password-req", "Password is required", function (value) {
      const isEdit = this.options.context?.isEditMode;
      if (!isEdit && !value) return false;
      return true;
    })
    .min(6, "Password must be at least 6 characters")
    .nullable(),
});
