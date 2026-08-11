import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";

import MeetingRoomIcon from "@mui/icons-material/MeetingRoomOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { authApi } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing or invalid. Please request a new one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not reset your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f7f78a",
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          bgcolor: "#e56d6d",
        }}
        elevation={0}
        variant="outlined"
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            color: "#ffffff",
          }}
        >
          <MeetingRoomIcon
            sx={{
              fontSize: 32,
              color: "#ffffff",
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            MeetSpace
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: "#ffffff",
          }}
        >
          Choose a new password for your account.
        </Typography>

        {!token && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No reset token found in this link. Please use the link from your email, or
            request a new one.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset successfully. Redirecting to sign in…
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            placeholder="New password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: "#ffffff",

              "& .MuiInputBase-input": {
                color: "#000000",
              },

              "& .MuiInputBase-input::placeholder": {
                color: "#333333",
                opacity: 1,
              },

              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#dddddd",
                },

                "&:hover fieldset": {
                  borderColor: "#c33535",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#c33535",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    sx={{ color: "#274528" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            autoFocus
          />

          <TextField
            placeholder="Confirm new password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
              mb: 3,
              backgroundColor: "#ffffff",

              "& .MuiInputBase-input": {
                color: "#000000",
              },

              "& .MuiInputBase-input::placeholder": {
                color: "#333333",
                opacity: 1,
              },

              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#dddddd",
                },

                "&:hover fieldset": {
                  borderColor: "#c33535",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#c33535",
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              backgroundColor: "#274528",
              color: "#ffffff",

              "&:hover": {
                backgroundColor: "#1d3520",
              },
            }}
          >
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 3,
            color: "#ffffff",
          }}
        >
          Remembered it?{" "}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: "#30d258",
              fontWeight: 600,
            }}
          >
            Back to Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
