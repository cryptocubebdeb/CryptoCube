"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

import Sidebar from "../../components/Sidebar";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// Match your new Prisma shape (string id, firstName/lastName)
type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
};

export default function Page() {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string })?.id;
  const { t } = useTranslation();

  // toggles
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // user data
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  // password dialog state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setIsSavingPassword(false);
  };

  const closePasswordDialog = () => {
    resetPasswordFields();
    setIsPopupOpen(false);
  };

  const togglePopup = () => setIsPopupOpen((v) => !v);

  const validatePasswordStrength = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async () => {
    if (!user || !userId) return;

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError(t("accountDetails.passwordAllFieldsRequired"));
      return;
    }

    if (!validatePasswordStrength(newPassword)) {
      setPasswordError(
        t("accountDetails.passwordStrengthRequirement")
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("accountDetails.passwordsDoNotMatch"));
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordError(null);

      const res = await fetch(`/api/user/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || t("accountDetails.updatePasswordFailed")
        );
      }

      resetPasswordFields();
      setIsPopupOpen(false);
    } catch (e: unknown) {
      setPasswordError((e as Error)?.message ?? t("accountDetails.genericErrorOccurred"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Load user profile from API using the logged-in userId
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !userId) {
      setError(t("accountDetails.unauthenticated"));
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await fetch(`/api/user/${userId}/settings`);
        if (!res.ok) {
          throw new Error(t("accountDetails.fetchUserFailed"));
        }
        const userData: User = await res.json();

        setUser(userData);
        setFirstName(userData.firstName ?? "");
        setLastName(userData.lastName ?? "");
        setEmail(userData.email ?? "");
        setUsername(userData.username ?? "");
      } catch (e: unknown) {
        setError(
          (e as Error)?.message ?? t("accountDetails.loadUserError")
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [status, userId]);

  const savePersonal = async () => {
    if (!user || !userId) return;
    try {
      const res = await fetch(`/api/user/${userId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          username,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t("accountDetails.updateUserFailed"));
      }
      const updatedUser: User = await res.json();
      setUser(updatedUser);
      setIsEditingPersonal(false);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? t("accountDetails.savePersonalError"));
    }
  };

  const saveProfile = async () => {
    if (!user || !userId) return;
    try {
      const res = await fetch(`/api/user/${userId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          username,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t("accountDetails.updateUserFailed"));
      }
      const updatedUser: User = await res.json();
      setUser(updatedUser);
      setIsEditingProfile(false);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? t("accountDetails.saveProfileError"));
    }
  };

  // basic loading / error states
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        {t("accountDetails.loading")}
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-red-400">
        {error || t("accountDetails.loadError")}
      </div>
    );
  }

  return (
    <div className="flex h-screen p-10">
      {/* You’ll need Sidebar to accept string userId now */}
      <Sidebar />

      <main className={`${"main"} flex-1 mt-1 rounded-2xl overflow-auto`}>
        <h2 className={`${"title"}`}>{t("accountDetails.title")}</h2>

        <div className="p-6 ml-5 mt-2 w-full max-w-full">
          {/* ----- Personal Info ----- */}
          <div className={`${"personalInfoHeader"}`}>
            <h2 className="text-xl">{t("accountDetails.personalHeader")}</h2>

            <Button
              variant="outlined"
              onClick={() =>
                isEditingPersonal ? savePersonal() : setIsEditingPersonal(true)
              }
              sx={{ mt: 1, mb: 1, mr: 10 }}
            >
              {isEditingPersonal ? t("accountDetails.save") : t("accountDetails.edit")}
            </Button>
          </div>

          <hr className="line"/>

          <div className="personInfo">
            <div className="infoText">
              <div className="nameFields">
                <div>
                  <p className="infoTitles">{t("accountDetails.firstNameLabel")}</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="inputField"
                    />
                  ) : (
                    <div className="nameDisplay">
                      {user.firstName || "—"}
                    </div>
                  )}
                </div>

                <div>
                  <p className="infoTitles">{t("accountDetails.lastNameLabel")}</p>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="inputField"
                    />
                  ) : (
                    <div className="nameDisplay">
                      {user.lastName || "—"}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="infoTitles">{t("accountDetails.emailLabel")}</p>
                {isEditingPersonal ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="inputEmailField"
                  />
                ) : (
                  <div className="emailDisplay">{user.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* ----- Profile Info ----- */}
          <div className="profileInfoHeader">
            <h2 className="text-xl">{t("accountDetails.profileHeader")}</h2>

            <Button
              variant="outlined"
              onClick={() =>
                isEditingProfile ? saveProfile() : setIsEditingProfile(true)
              }
              sx={{ mt: 1, mb: 1, mr: 10 }}
            >
              {isEditingProfile ? "Sauvegarder" : "Modifier"}
            </Button>
          </div>

          <hr className="line" />

          <div className="profileInfo">
            <div>
              <p className="infoTitles">{t("accountDetails.usernameLabel")}</p>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="inputProfileField"
                />
              ) : (
                <div className="profileDisplay">
                  {user.username || "—"}
                </div>
              )}
            </div>

            <div>
              <p className="infoTitles">{t("accountDetails.passwordLabel")}</p>
              <div className="profileDisplay">{t("accountDetails.maskedPassword")}</div>
            </div>

            <Button
              variant="outlined"
              sx={{ width: "20%", marginTop: "1px" }}
              onClick={togglePopup}
            >
              {t("accountDetails.changePassword")}
            </Button>

            <Dialog
              open={isPopupOpen}
              onClose={closePasswordDialog}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  backgroundColor: "#15171E",
                  color: "white",
                  borderRadius: "12px",
                },
              }}
            >
              <DialogTitle sx={{ position: "relative", pr: 6 }}>
                {t("accountDetails.changePassword")}
                <IconButton
                  aria-label="close"
                  onClick={closePasswordDialog}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ pb: 0 }}>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    label={t("accountDetails.currentPasswordLabel")}
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "white",
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: "rgba(255,255,255,0.5)" },
                    }}
                  />

                  <TextField
                    label={t("accountDetails.newPasswordLabel")}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "white",
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: "rgba(255,255,255,0.5)" },
                    }}
                  />

                  <TextField
                    label={t("accountDetails.confirmPasswordLabel")}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "white",
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: "rgba(255,255,255,0.5)" },
                    }}
                  />

                  <div className="flex flex-row justify-between items-center">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {passwordError && (
                        <span style={{ color: "#ff7a7a" }}>
                          {passwordError}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        textTransform: "none",
                        color: "rgba(255,255,255,0.7)",
                        flexShrink: 0,
                      }}
                    >
                      {t("accountDetails.forgotPassword")}
                    </Button>
                  </div>
                </Stack>
              </DialogContent>

              <DialogActions
                sx={{
                  pr: 2,
                  pb: 2.5,
                  pl: 3,
                  justifyContent: "flex-start",
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handlePasswordChange}
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? t("accountDetails.savingPassword") : t("accountDetails.savePassword")}
                </Button>

                <Button
                  variant="outlined"
                  onClick={closePasswordDialog}
                  disabled={isSavingPassword}
                >
                  {t("accountDetails.cancel")}
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}
