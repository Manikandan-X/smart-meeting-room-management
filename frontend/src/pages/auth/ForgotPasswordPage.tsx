import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
} from "@mui/material";

import MeetingRoomIcon from "@mui/icons-material/MeetingRoomOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { authApi } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      setMessage(res.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send reset link."));
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
          Enter your email and we'll send you a link to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            placeholder="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoFocus
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
            {loading ? "Sending…" : "Send Reset Link"}
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
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: "#30d258",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
