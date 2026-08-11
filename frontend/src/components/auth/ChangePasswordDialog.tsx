import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { authApi } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordDialog({ open, onClose }: Props) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setForm({ current_password: "", new_password: "", confirm_password: "" });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.new_password !== form.confirm_password) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(handleClose, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not change your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Change Password</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password changed successfully.
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Current password"
              type={showCurrent ? "text" : "password"}
              required
              fullWidth
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrent((s) => !s)}
                      edge="end"
                      sx={{ color: "#274528" }}
                    >
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New password"
              type={showNew ? "text" : "password"}
              required
              fullWidth
              helperText="At least 8 characters"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNew((s) => !s)}
                      edge="end"
                      sx={{ color: "#274528" }}
                    >
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm new password"
              type={showNew ? "text" : "password"}
              required
              fullWidth
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              backgroundColor: "#274528",
              "&:hover": { backgroundColor: "#1d3520" },
            }}
          >
            {saving ? "Saving…" : "Change Password"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
