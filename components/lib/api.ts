import {
  AdminOtpPayload,
  AdminOtpResponse,
  AdminResetPayload,
  AdminResetResponse,
  AdminSignUpPayload,
  AdminSignUpResponse,
  AuthResponse,
  Category,
  CategoryPayload,
  CreateSubscriberRequest,
  Lifestyle,
  LifestyleCategory,
  LifestylePayload,
  Model,
  ModelPayload,
  ModelsCategory,
  Product,
  ProductPayload,
  PublicShopOverview,
  Review,
  ReviewPayload,
  SignupCodePayload,
  SignupCodeResponse,
  Subscribers,
  Team,
  TeamGrouped,
  TeamPayload,
  TeamSections,
  Tips,
  TipsCategory,
  TipsPayload,
  Trends,
  TrendsFocus,
  TrendsPayload,
} from "../types/api";
import { apiRequest } from "./apiClient";

export const api = {
  // AUTH ENDPOINTS
  auth: {
    adminSignup: (data: AdminSignUpPayload): Promise<AdminSignUpResponse> =>
      apiRequest<AdminSignUpResponse>("/auth/admin/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    adminSignin: (data: Record<string, string>): Promise<AuthResponse> =>
      apiRequest<AuthResponse>("/auth/admin/signin", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    adminSignUpCode: (data: SignupCodePayload): Promise<SignupCodeResponse> =>
      apiRequest<SignupCodeResponse>("/auth/admin/signup-codes", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    adminForgotPasswordReset: (
      data: AdminResetPayload,
    ): Promise<AdminResetResponse> =>
      apiRequest<AdminResetResponse>("/auth/admin/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    adminForgotPasswordOtp: (
      data: AdminOtpPayload,
    ): Promise<AdminOtpResponse> =>
      apiRequest<AdminOtpResponse>("/auth/admin/forgot-password/sent-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // PUBLIC SHOP ENDPOINTS
  publicShop: {
    getOverview: (): Promise<PublicShopOverview> =>
      apiRequest<PublicShopOverview>("/shop"),

    getCategories: (): Promise<Category[]> =>
      apiRequest<Category[]>("/shop/categories"),

    getProducts: (): Promise<Product[]> =>
      apiRequest<Product[]>("/shop/products"),

    getProductBySlug: (slug: string): Promise<Product> =>
      apiRequest<Product>(`/shop/products/${slug}`),

    getProductReviewsBySlug: (slug: string): Promise<Review[]> =>
      apiRequest<Review[]>(`/shop/products/${slug}/reviews`),

    postProductReviewsBySlug: (
      slug: string,
      data: ReviewPayload,
    ): Promise<Review> =>
      apiRequest<Review>(`/shop/products/${slug}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    //beauty tips
    getBeautyTips: (): Promise<Tips[]> => apiRequest<Tips[]>("/beauty-tips"),

    getBeautyTipsByCategories: (): Promise<TipsCategory[]> =>
      apiRequest<TipsCategory[]>("/beauty-tips/categories"),

    getBeautyTipsBySlug: (slug: string): Promise<Tips> =>
      apiRequest<Tips>(`/beauty-tips/${slug}`),
    // lifestyle
    getLifestyle: (): Promise<Lifestyle[]> =>
      apiRequest<Lifestyle[]>("/lifestyle"),

    getLifestyleByCategories: (): Promise<LifestyleCategory[]> =>
      apiRequest<LifestyleCategory[]>("/lifestyle/categories"),

    getLifestyleBySlug: (slug: string): Promise<Lifestyle> =>
      apiRequest<Lifestyle>(`/lifestyle/${slug}`),

    //models
    getModel: (): Promise<Model[]> => apiRequest<Model[]>("/seraphe-models"),

    getModelByCategories: (): Promise<ModelsCategory[]> =>
      apiRequest<ModelsCategory[]>("/seraphe-models/categories"),

    getModelById: (id: string): Promise<Model> =>
      apiRequest<Model>(`/seraphe-models/${id}`),

    // trends
    getTrends: (): Promise<Trends[]> => apiRequest<Trends[]>("/trends"),

    getTrendsByFocusAreas: (): Promise<TrendsFocus[]> =>
      apiRequest<TrendsFocus[]>("/trends/focus-areas"),

    getTrendsBySlug: (slug: string): Promise<Trends> =>
      apiRequest<Trends>(`/trends/${slug}`),

    // team
    getTeam: (): Promise<Team[]> => apiRequest<Team[]>("/team"),

    getTeamByGrouped: (): Promise<TeamGrouped[]> =>
      apiRequest<TeamGrouped[]>("/team/grouped"),

    getTeamBySection: (): Promise<TeamSections[]> =>
      apiRequest<TeamSections[]>(`/team/section`),

    // COMMUNITY
    createSubscriber: (
      data: CreateSubscriberRequest,
    ): Promise<CreateSubscriberRequest> =>
      apiRequest<CreateSubscriberRequest>("/community/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ADMIN DASHBOARD ENDPOINTS
  adminShop: {
    // Categories Management
    getCategories: (): Promise<Category[]> =>
      apiRequest<Category[]>("/admin/shop/categories"),

    getCategoriesId: (id: string | number): Promise<Category[]> =>
      apiRequest<Category[]>(`/admin/shop/categories/${id}`),

    createCategory: (data: CategoryPayload): Promise<Category> =>
      apiRequest<Category>("/admin/shop/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateCategory: (
      id: string | number,
      data: CategoryPayload,
    ): Promise<Category> =>
      apiRequest<Category>(`/admin/shop/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteCategory: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(
        `/admin/shop/categories/${id}`,
        { method: "DELETE" },
      ),

    // Products Management
    getProducts: (): Promise<Product[]> =>
      apiRequest<Product[]>("/admin/shop/products"),

    getProductId: (id: string | number): Promise<Product[]> =>
      apiRequest<Product[]>(`/admin/shop/products/${id}`),

    createProduct: (data: ProductPayload): Promise<Product> =>
      apiRequest<Product>("/admin/shop/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateProduct: (
      id: string | number,
      data: Partial<ProductPayload>,
    ): Promise<Product> =>
      apiRequest<Product>(`/admin/shop/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteProduct: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(
        `/admin/shop/products/${id}`,
        { method: "DELETE" },
      ),

    // Lifestyle Management
    getLifestyle: (): Promise<Lifestyle[]> =>
      apiRequest<Lifestyle[]>("/admin/lifestyle"),

    getLifestyleId: (id: string | number): Promise<Lifestyle[]> =>
      apiRequest<Lifestyle[]>(`/admin/lifestyle/${id}`),

    createLifestyle: (data: LifestylePayload): Promise<Lifestyle> =>
      apiRequest<Lifestyle>("/admin/lifestyle", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateLifestyle: (
      id: string | number,
      data: Partial<LifestylePayload>,
    ): Promise<Lifestyle> =>
      apiRequest<Lifestyle>(`/admin/lifestyle/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteLifestyle: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(
        `/admin/lifestyle/${id}`,
        { method: "DELETE" },
      ),

    // Beauty-Tips Management
    getTips: (): Promise<Tips[]> => apiRequest<Tips[]>("/admin/beauty-tips"),

    getTipsId: (id: string | number): Promise<Tips[]> =>
      apiRequest<Tips[]>(`/admin/beauty-tips/${id}`),

    createTips: (data: TipsPayload): Promise<Tips> =>
      apiRequest<Tips>("/admin/beauty-tips", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateTips: (
      id: string | number,
      data: Partial<TipsPayload>,
    ): Promise<Tips> =>
      apiRequest<Tips>(`/admin/beauty-tips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteTips: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(
        `/admin/beauty-tips/${id}`,
        { method: "DELETE" },
      ),

    // reviews
    getProductReviews: (): Promise<Review[]> =>
      apiRequest<Review[]>("/admin/shop/reviews"),

    // Model
    getModels: (): Promise<Model[]> =>
      apiRequest<Model[]>("/admin/seraphe-models"),

    getModelId: (id: string | number): Promise<Model[]> =>
      apiRequest<Model[]>(`/admin/seraphe-models/${id}`),

    createModel: (data: ModelPayload): Promise<Model> =>
      apiRequest<Model>("/admin/seraphe-models", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateModel: (
      id: string | number,
      data: Partial<ModelPayload>,
    ): Promise<Model> =>
      apiRequest<Model>(`/admin/seraphe-models/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteModel: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(
        `/admin/seraphe-models/${id}`,
        { method: "DELETE" },
      ),

    // Trends Management
    getTrends: (): Promise<Trends[]> => apiRequest<Trends[]>("/admin/trends"),
    getTrendsId: (id: string | number): Promise<Trends[]> =>
      apiRequest<Trends[]>(`/admin/trends/${id}`),
    createTrends: (data: TrendsPayload): Promise<Trends> =>
      apiRequest<Trends>("/admin/trends", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateTrends: (
      id: string | number,
      data: Partial<TrendsPayload>,
    ): Promise<Trends> =>
      apiRequest<Trends>(`/admin/trends/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteTrends: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(`/admin/trends/${id}`, {
        method: "DELETE",
      }),

    // Subscribers
    getSubscribers: (): Promise<Subscribers[]> =>
      apiRequest<Subscribers[]>("/admin/community/subscribers"),
    getSubscriberId: (id: string | number): Promise<Subscribers[]> =>
      apiRequest<Subscribers[]>(`/admin/community/subscribers/${id}`),

    deleteSubscribers: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(
        `/admin/community-subscribers/${id}`,
        {
          method: "DELETE",
        },
      ),

    // Team management
    getTeam: (): Promise<Team[]> => apiRequest<Team[]>("/admin/team"),
    getTeamId: (id: string | number): Promise<Team[]> =>
      apiRequest<Team[]>(`/admin/team/${id}`),
    createTeam: (data: TeamPayload): Promise<Team> =>
      apiRequest<Team>("/admin/team", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateTeam: (
      id: string | number,
      data: Partial<TeamPayload>,
    ): Promise<Team> =>
      apiRequest<Team>(`/admin/team/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    deleteTeam: (
      id: string | number,
    ): Promise<{ success: boolean; message: string }> =>
      apiRequest<{ success: boolean; message: string }>(`/admin/team/${id}`, {
        method: "DELETE",
      }),
  },
};
