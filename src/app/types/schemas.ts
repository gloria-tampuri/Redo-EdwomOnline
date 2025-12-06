import * as z from 'zod';

/**
 * Login Form Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Sign Up Form Validation Schema
 */
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Forgot Password Form Validation Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Form Validation Schema
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;



/**
 * Order Schemas
 */
export const CreateOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional(),
    address: z.string().optional(),
  }),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    image: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
  })).min(1, 'At least one item is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  deliveryLocation: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
});

export type CreateOrderType = z.infer<typeof CreateOrderSchema>;

/**
 * Item Schemas
 */
export const CreateItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').min(2, 'Name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  discount: z.number().min(0, 'Discount cannot be negative').optional(),
  stock: z.number().nonnegative('Stock cannot be negative'),
  status: z.enum(['In Stock', 'Out of Stock', 'Low Stock']).optional(),
  image: z.string().optional(), // Cloudinary secure URL
});

export type CreateItemType = z.infer<typeof CreateItemSchema>;

export const UpdateItemSchema = CreateItemSchema.partial();

export type UpdateItemType = z.infer<typeof UpdateItemSchema>;

/**
 * Category Schemas
 */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  image: z.string().optional(), // Cloudinary secure URL
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>;

