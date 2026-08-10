import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

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

import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
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
          Sign in to manage meeting rooms and resources.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Email */}
          <TextField
            placeholder="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoFocus
          />

          <TextField
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    sx={{
                      color: "#274528",
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Sign In Button */}
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
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </Box>

        {/* Register Link */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 3,
            color: "#ffffff",
          }}
        >
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/register"
            sx={{
              color: "#30d258",
              fontWeight: 600,
            }}
          >
            Create one
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
