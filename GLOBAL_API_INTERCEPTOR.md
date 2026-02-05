# Global API Interceptor - Implementation Summary

## ✅ What Has Been Implemented

### 1. **Root Navigation Helper** 
**File:** [src/navigation/RootNavigation.ts](g:\CRM\application\CRMApp\src\navigation\RootNavigation.ts)

- Creates a global navigation reference
- Provides `navigate()`, `replace()`, and `goBack()` functions
- Can be called from anywhere in the app (even outside components)

### 2. **Enhanced API Client with Auto-Logout**
**File:** [src/api/client.ts](g:\CRM\application\CRMApp\src\api\client.ts)

#### Request Interceptor:
- ✅ Automatically adds JWT token to all requests
- ✅ Reads token from AsyncStorage

#### Response Interceptor:
- ✅ **Account Deactivation Handler (403 + ACCOUNT_DEACTIVATED)**
  - Detects `403` status with `code: 'ACCOUNT_DEACTIVATED'`
  - Clears all AsyncStorage (token, user data)
  - Shows alert: "Account Deactivated - Contact administrator"
  - Navigates to Login screen when user presses OK
  
- ✅ **Session Expiration Handler (401)**
  - Clears storage
  - Shows "Session Expired" alert
  - Navigates to Login

- ✅ **Network Errors**
  - Shows connection error alert

- ✅ **Server Errors (500, 502, 503)**
  - Shows server error alert

- ✅ **Access Denied (403 - other cases)**
  - Shows permission denied alert

- ✅ **Not Found (404)**
  - Shows resource not found alert

### 3. **Navigation Container Update**
**File:** [src/navigation/index.tsx](g:\CRM\application\CRMApp\src\navigation\index.tsx)

- ✅ Added `navigationRef` to `NavigationContainer`
- ✅ Enables global navigation control

---

## 🔄 How It Works

### Flow Diagram:

```
API Call → Request Interceptor → Add JWT Token
    ↓
Server Response
    ↓
Response Interceptor
    ↓
Is status 403 + code = ACCOUNT_DEACTIVATED?
    ├─ YES → Clear Storage → Show Alert → Navigate to Login
    └─ NO → Check other error codes → Show appropriate alert
```

### Example Backend Response (Account Deactivated):

```json
HTTP 403 Forbidden
{
  "success": false,
  "code": "ACCOUNT_DEACTIVATED",
  "message": "Your account has been deactivated by the administrator."
}
```

### What Happens in App:

1. ✅ User makes API call (e.g., `apiClient.get('/leads')`)
2. ✅ Server returns `403` with `ACCOUNT_DEACTIVATED` code
3. ✅ Interceptor catches the error
4. ✅ Calls `clearStorage()` - removes token & user data
5. ✅ Shows alert: "Account Deactivated - Contact administrator"
6. ✅ When user clicks OK → navigates to Login screen
7. ✅ User is now logged out and must re-login

---

## 📝 Usage in Components

### ✅ You Don't Need to Change Existing Code!

All existing services already use `apiClient`, so they automatically benefit:

```typescript
import {leadService} from '../services/leadService';

// This already has auto-logout on deactivation!
const leads = await leadService.getLeads();
```

### ✅ For New API Calls:

```typescript
import apiClient from '../api/client';

const fetchData = async () => {
  try {
    const response = await apiClient.get('/leads');
    setData(response.data.data);
  } catch (error: any) {
    // Deactivation is handled automatically by interceptor
    // Only show custom errors for other cases
    if (error.response?.data?.code !== 'ACCOUNT_DEACTIVATED') {
      Alert.alert('Error', 'Failed to fetch data');
    }
  }
};
```

### ✅ Best Practice:

```typescript
try {
  await apiClient.post('/leads', leadData);
} catch (error: any) {
  // Skip alert if account was deactivated (interceptor handles it)
  if (error.response?.data?.code !== 'ACCOUNT_DEACTIVATED') {
    Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
  }
}
```

---

## 🧪 Testing Scenarios

### Test 1: Account Deactivation
```bash
# Backend returns:
HTTP 403
{
  "code": "ACCOUNT_DEACTIVATED",
  "message": "Account deactivated by admin"
}

# Expected Result:
✅ Storage cleared
✅ Alert shown
✅ Navigated to Login screen
```

### Test 2: Session Expiration
```bash
# Backend returns:
HTTP 401
{
  "message": "Invalid token"
}

# Expected Result:
✅ Storage cleared
✅ "Session Expired" alert
✅ Navigated to Login screen
```

### Test 3: Regular Permission Denied
```bash
# Backend returns:
HTTP 403
{
  "message": "Insufficient permissions"
}

# Expected Result:
✅ "Access Denied" alert
✅ User stays on current screen
✅ Storage NOT cleared
```

---

## 🔧 Files Modified

1. ✅ [src/api/client.ts](g:\CRM\application\CRMApp\src\api\client.ts) - Enhanced interceptors
2. ✅ [src/navigation/RootNavigation.ts](g:\CRM\application\CRMApp\src\navigation\RootNavigation.ts) - Created
3. ✅ [src/navigation/index.tsx](g:\CRM\application\CRMApp\src\navigation\index.tsx) - Added navigationRef
4. ✅ [src/api/USAGE_GUIDE.tsx](g:\CRM\application\CRMApp\src\api\USAGE_GUIDE.tsx) - Created (documentation)

---

## ✨ Features

✅ **Global Auto-Logout** - Works across entire app  
✅ **Account Deactivation Detection** - Specific error code handling  
✅ **Automatic Navigation** - No manual redirect needed  
✅ **Alert System** - User-friendly error messages  
✅ **Storage Cleanup** - Removes all auth data  
✅ **Backward Compatible** - Existing code works without changes  
✅ **Multiple Error Codes** - Handles 401, 403, 404, 500, etc.  

---

## 🚀 Benefits

1. **Zero Code Changes Required** - All existing API calls automatically protected
2. **Consistent UX** - Same logout flow everywhere
3. **Security** - Immediate logout on deactivation
4. **Developer Friendly** - One central place to manage API errors
5. **Easy Testing** - Mock server responses to test flows

---

## 📚 Additional Resources

- See [USAGE_GUIDE.tsx](g:\CRM\application\CRMApp\src\api\USAGE_GUIDE.tsx) for code examples
- All services in `/services` folder automatically use this
- No changes needed to existing components

---

**Implementation Complete! 🎉**
