---
name: connect-fe-be
description: >
  Connect React frontend to Express/MongoDB backend via RESTful API. Use this skill whenever the user wants
  to integrate frontend components with backend services, handle API requests, manage authentication, and implement
  common CRUD operations.
---

# Frontend-Backend RESTful API Integration

Comprehensive skills for connecting React frontend to Express/MongoDB backend via RESTful API. Covers API service setup, state management, authentication, error handling, and common CRUD patterns based on Herdays project structure.

## System Architecture Overview

"clean up code", "fix issues in my project". Use even when user says things like "look at my repo",
"check if my code is good", or pastes a code snippet and asks for feedback. Always use this skill
when a codebase, directory, or code file is mentioned alongside any request for analysis or improvement.

---

# Frontend-Backend RESTful API Integration

Comprehensive skills for connecting React frontend to Express/MongoDB backend via RESTful API. Covers API service setup, state management, authentication, error handling, and common CRUD patterns based on Herdays project structure.

## System Architecture Overview

### API Configuration

- **Base URL**: `/herdays-api` (configurable via `VITE_BACKEND_URL` env var)
- **Authentication**: JWT Bearer token in `Authorization` header
- **Response Format**: `{ success, statusCode, message, data, meta, errors }`
- **Error Format**: `{ statusCode, message, errors: { fieldName: "error message" } }`
- **Token Storage**: `localStorage` with keys `accessToken` and `refreshToken`

### Backend Structure

- **Routes**: 12 modules in `backend/src/routes/`
  - Auth routes: login, register, refresh token, logout, OTP verification
  - Blog routes: posts, topics, admin operations
  - Product routes: catalog, filtering, search
  - Order routes: creation, tracking, admin management
  - Cart routes: add/remove items, checkout
  - Profile routes: user data, preferences
  - Upload routes: file handling via Cloudinary
- **Controllers**: Validate requests and delegate to services
- **Services**: Implement business logic and data transformation
- **Models**: Mongoose schemas (User, BlogPost, Product, Order, etc.)
- **Middleware**:
  - `authMiddleware`: Validates JWT, injects `req.user` with role
  - `errorMiddleware`: Normalizes errors to standard format
  - `adminMiddleware`: Validates admin role

### Frontend Structure

- **API Service**: `frontend/src/services/apiService.js` - centralized fetch handler
- **State Management**: Redux directory exists (empty) - ready for implementation
- **Store/Context**: `frontend/src/stores/` - available for custom context
- **Utilities**: `frontend/src/utils/` - helpers for HTTP operations

---

## Skill 1: Setting Up the API Service Layer

### Overview

Create a centralized, reusable API service that handles all HTTP communication with consistent error handling, JWT token management, and request/response interception.

### When to Use

- Creating new API integration methods
- Adding request/response interceptors
- Handling authentication token refresh
- Standardizing error messages across frontend

### Implementation Steps

#### 1. Create Core API Service (`frontend/src/services/apiService.js`)

```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "/herdays-api";
const TOKEN_KEYS = { access: "accessToken", refresh: "refreshToken" };

class ApiService {
  // Get stored tokens
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEYS.access);
  }

  getRefreshToken() {
    return localStorage.getItem(TOKEN_KEYS.refresh);
  }

  // Set tokens after login
  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(TOKEN_KEYS.access, accessToken);
    if (refreshToken) localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
  }

  // Clear tokens on logout
  clearTokens() {
    localStorage.removeItem(TOKEN_KEYS.access);
    localStorage.removeItem(TOKEN_KEYS.refresh);
  }

  // Build Authorization header
  getAuthHeader() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Core request method with error handling
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        // Handle expired token
        if (response.status === 401 && data.message.includes("token")) {
          await this.refreshAccessToken();
          return this.request(endpoint, options); // Retry request
        }
        throw new ApiError(data.message, response.status, data.errors);
      }

      return data; // { success, statusCode, message, data, meta }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message, 500);
    }
  }

  // Refresh expired token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error("Token refresh failed");
    }

    const { data } = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
  }

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

class ApiError extends Error {
  constructor(message, statusCode, errors = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // Field-level validation errors
  }
}

export default new ApiService();
export { ApiError };
```

#### 2. Environment Configuration (`frontend/.env` & `.env.example`)

```
# Backend API URL
VITE_BACKEND_URL=/herdays-api
```

---

## Skill 2: State Management with Redux

### Overview

Implement Redux for centralized API state, caching, loading states, and error handling across the frontend application.

### When to Use

- Managing shared API data (user profile, products, blog posts)
- Handling global loading/error states
- Caching API responses to avoid duplicate requests
- Coordinating async operations (login, registration, data fetching)

### Implementation Steps

#### 1. Install Redux

```bash
npm install redux @reduxjs/toolkit react-redux
```

#### 2. Create Redux Slices

**User Slice** (`frontend/src/redux/slices/userSlice.js`):

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });
      apiService.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.errors || error.message);
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "user/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get("/profile/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
    isAuthenticated: !!apiService.getAccessToken(),
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        apiService.clearTokens();
      });
  },
});

export default userSlice.reducer;
```

**Products Slice** (`frontend/src/redux/slices/productSlice.js`):

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters,
      });
      const response = await apiService.get(`/products?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0 },
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
```

#### 3. Configure Store (`frontend/src/redux/store.js`)

```javascript
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productReducer,
  },
});
```

#### 4. Setup Redux Provider (`frontend/src/main.jsx`)

```javascript
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

---

## Skill 3: Authentication Flow Implementation

### Overview

Implement JWT-based authentication with token refresh logic, protected routes, and role-based access control.

### When to Use

- Implementing login/logout functionality
- Protecting routes based on authentication status
- Implementing role-based access control (admin vs user)
- Handling expired tokens transparently

### Implementation Steps

#### 1. Login Service (`frontend/src/services/authService.js`)

```javascript
import apiService, { ApiError } from "./apiService";

const authService = {
  async login(email, password) {
    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data;
      apiService.setTokens(accessToken, refreshToken);
      return { success: true, user };
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiService.post("/auth/register", userData);
      const { accessToken, refreshToken, user } = response.data;
      apiService.setTokens(accessToken, refreshToken);
      return { success: true, user };
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await apiService.post("/auth/logout", {});
    } catch (error) {
      console.warn("Logout request failed, clearing local tokens");
    } finally {
      apiService.clearTokens();
    }
  },

  async verifyOTP(email, otp) {
    return apiService.post("/auth/verify-otp", { email, otp });
  },

  async resendOTP(email) {
    return apiService.post("/auth/resend-otp", { email });
  },

  isAuthenticated() {
    return !!apiService.getAccessToken();
  },

  getCurrentUser() {
    return apiService.get("/profile/me");
  },
};

export default authService;
```

#### 2. Protected Route Wrapper (`frontend/src/components/ProtectedRoute.jsx`)

```javascript
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, currentUser, loading } = useSelector(
    (state) => state.user,
  );

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
```

#### 3. Login Component Example (`frontend/src/pages/LoginPage.jsx`)

```javascript
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/userSlice";
import authService from "../services/authService";
import { useState } from "react";

export function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <p style={{ color: "red" }}>{JSON.stringify(error)}</p>}
    </form>
  );
}
```

---

## Skill 4: Common CRUD Operations Pattern

### Overview

Standard patterns for Create, Read, Update, Delete operations with the backend.

### When to Use

- Adding new API endpoints to frontend
- Creating reusable service methods
- Implementing data mutation operations

### Generic CRUD Service Pattern

```javascript
// Example: productService.js
import apiService from "./apiService";

const productService = {
  // List with pagination
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await apiService.get(`/products?${params}`);
    return response.data; // { items: [...], meta: { page, limit, total } }
  },

  // Get single item
  async getById(id) {
    const response = await apiService.get(`/products/${id}`);
    return response.data;
  },

  // Create new item
  async create(productData) {
    const response = await apiService.post("/products", productData);
    return response.data;
  },

  // Update existing item
  async update(id, productData) {
    const response = await apiService.put(`/products/${id}`, productData);
    return response.data;
  },

  // Partial update
  async patch(id, productData) {
    const response = await apiService.patch(`/products/${id}`, productData);
    return response.data;
  },

  // Delete item
  async delete(id) {
    await apiService.delete(`/products/${id}`);
    return { success: true };
  },

  // Search endpoint
  async search(query) {
    const response = await apiService.get(
      `/products/search?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  },
};

export default productService;
```

### Component Usage Example

```javascript
import { useEffect, useState } from "react";
import productService from "../services/productService";

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll(
        pagination.page,
        pagination.limit,
      );
      setProducts(data.items);
      setPagination(data.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button
        onClick={() =>
          setPagination({ ...pagination, page: pagination.page + 1 })
        }
      >
        Next Page
      </button>
    </div>
  );
}
```

---

## Skill 5: Error Handling & Validation

### Overview

Standardized error handling for API responses, validation errors, and network failures.

### When to Use

- Displaying user-friendly error messages
- Handling field-level validation errors
- Recovering from network failures
- Logging errors for debugging

### Error Handler Utility (`frontend/src/utils/errorHandler.js`)

```javascript
import { ApiError } from "../services/apiService";

export class ErrorHandler {
  static handle(error) {
    if (error instanceof ApiError) {
      return this.handleApiError(error);
    }
    if (error instanceof TypeError) {
      return {
        message: "Network error. Please check your connection.",
        statusCode: 0,
      };
    }
    return {
      message: error.message || "An unexpected error occurred",
      statusCode: 500,
    };
  }

  static handleApiError(error) {
    // Field-level validation errors (e.g., email already exists)
    if (error.errors && Object.keys(error.errors).length > 0) {
      return {
        message: "Validation error",
        statusCode: error.statusCode,
        fieldErrors: error.errors, // { fieldName: "error message" }
      };
    }

    // General API error
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  static getFieldError(fieldErrors, fieldName) {
    return fieldErrors?.[fieldName] || null;
  }

  static isValidationError(error) {
    return error.fieldErrors && Object.keys(error.fieldErrors).length > 0;
  }
}

// Usage in component
try {
  await authService.register(formData);
} catch (error) {
  const errorInfo = ErrorHandler.handle(error);
  if (ErrorHandler.isValidationError(errorInfo)) {
    setFieldErrors(errorInfo.fieldErrors);
  } else {
    setGeneralError(errorInfo.message);
  }
}
```

---

## Skill 6: Translating Backend Error Responses to Vietnamese

### Overview

Backend services throw `HttpError` with English messages (e.g., `"Invalid credentials"`, `"User not found"`). The frontend is responsible for translating these to Vietnamese before displaying them to users. Translation happens **client-side in `apiService.js`** — the backend stays language-agnostic.

### When to Use

- Every new error message added to any backend service must have a Vietnamese translation entry added to `translateError.js`
- When a component displays `toast.error(error.message)`, the message is already translated by `apiService.js`
- Adding new `HttpError` throws to any backend service file

### Implementation

#### 1. Translation Map (`frontend/src/utils/translateError.js`)

```javascript
const TRANSLATIONS = {
  // Auth — credentials
  'Invalid credentials':                  'Tài khoản hoặc mật khẩu không đúng',
  'User not found':                       'Không tìm thấy tài khoản',
  'Email or phone already exists':        'Email hoặc số điện thoại đã được sử dụng',

  // Auth — OTP
  'Invalid or expired OTP':               'OTP không hợp lệ hoặc đã hết hạn',
  'OTP attempt limit exceeded':           'Bạn đã nhập sai OTP quá nhiều lần',

  // Auth — verification
  'Please confirm OTP before login':    'Vui lòng xác thực OTP trước khi đăng nhập',

  // Auth — tokens
  'Invalid or expired refresh token':     'Token làm mới không hợp lệ hoặc đã hết hạn',

  // Auth — password
  'Current password is incorrect':         'Mật khẩu hiện tại không đúng',
  'Invalid or expired reset token':       'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',

  // Auth — identifier / Google
  'Invalid identifier':                  'Định danh không hợp lệ',
  'Google account does not include an email': 'Tài khoản Google không có email',

  // Auth — social login
  'Please register with email, phone and password before social login':
    'Vui lòng đăng ký bằng email, số điện thoại và mật khẩu trước khi đăng nhập bằng mạng xã hội',

  // Generic
  'Unable to connect to server.':        'Không thể kết nối đến máy chủ.',
}

export function translateError(message) {
  if (!message || typeof message !== 'string') return message
  return TRANSLATIONS[message] ?? message
}
```

#### 2. Integration in `apiService.js`

```javascript
import { translateError } from '../utils/translateError.js'

const request = async (path, options) => {
  const response = await fetch(`${API_BASE_URL}${path}`, ...)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success !== true) {
    // Translate BEFORE throwing — all consumers get Vietnamese automatically
    const message = translateError(payload.message || 'Unable to connect to server.')
    const error = new Error(message)
    error.statusCode = payload.statusCode || response.status
    error.details = payload.errors || null
    throw error
  }
  return payload
}
```

#### 3. Adding a New Error

When adding a new `HttpError` in any backend service:

1. Keep the message **in English** in the backend service
2. Add the English → Vietnamese mapping in `translateError.js`:

```javascript
'New English message': 'Bản dịch tiếng Việt',
```

#### Translation Checklist

| Backend English message | Vietnamese display |
|---|---|
| `Invalid credentials` | `Tài khoản hoặc mật khẩu không đúng` |
| `User not found` | `Không tìm thấy tài khoản` |
| `Email or phone already exists` | `Email hoặc số điện thoại đã được sử dụng` |
| `Invalid or expired OTP` | `OTP không hợp lệ hoặc đã hết hạn` |
| `OTP attempt limit exceeded` | `Bạn đã nhập sai OTP quá nhiều lần` |
| `Please confirm OTP before login` | `Vui lòng xác thực OTP trước khi đăng nhập` |
| `Invalid or expired refresh token` | `Token làm mới không hợp lệ hoặc đã hết hạn` |
| `Current password is incorrect` | `Mật khẩu hiện tại không đúng` |
| `Invalid or expired reset token` | `Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn` |
| `Invalid identifier` | `Định danh không hợp lệ` |
| `Google account does not include an email` | `Tài khoản Google không có email` |

---

## API Endpoint Reference

Based on backend routes, common endpoints available:

### Authentication

- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify OTP for registration
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout (requires auth)

### Products

- `GET /products?page=1&limit=10` - List products with pagination
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Blog

- `GET /blog/posts` - List blog posts
- `GET /blog/posts/:id` - Get blog post
- `POST /blog/posts` - Create post (admin only)
- `GET /blog/topics` - List topics

### Orders

- `GET /orders` - List user orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `GET /admin/orders` - List all orders (admin only)

### Cart

- `GET /cart` - Get cart
- `POST /cart/add` - Add item
- `DELETE /cart/items/:itemId` - Remove item

### Profile

- `GET /profile/me` - Get current user profile
- `PUT /profile` - Update profile

---

## Best Practices

1. **Always handle loading and error states** in components
2. **Use Redux for shared state**, local `useState` for component-specific state
3. **Centralize API calls** in service files, never call API directly from components
4. **Validate user input** before sending to backend
5. **Display field-level errors** from validation responses
6. **Implement token refresh** transparently in API service
7. **Use environment variables** for API base URL
8. **Clear tokens on 401 responses** to force re-authentication
9. **Log API errors** for debugging in development
10. **Implement pagination** for large datasets
