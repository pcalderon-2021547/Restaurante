import { useEffect, useMemo, useRef, useState } from "react";
import { useUserManagementStore } from "../store/useUserManagmentStore.js";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { CreateUserModal } from "./CreateUserModal.jsx";
import { useAuthStore } from "../../auth/store/authStore.js";
import { UserDetailModal } from "./UserDetailModal.jsx";
import { register as registerApi } from "../../../shared/api/auth.js";

const PAGE_SIZE = 8;

const ROLE_STYLE = {
    ADMIN_ROLE: { label: "Admin",   color: "#c9a84c", bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.3)" },
    USER_ROLE:  { label: "Usuario", color: "#7eb8f7", bg: "rgba(126,184,247,0.1)", border: "rgba(126,184,247,0.3)" },
};

export const Users = () => {
    const users          = useUserManagementStore((s) => s.users);
    const loading        = useUserManagementStore((s) => s.loading);
    const error          = useUserManagementStore((s) => s.error);
    const fetchUsers     = useUserManagementStore((s) => s.fetchUsers);
    const updateUserRole = useUserManagementStore((s) => s.updateUserRole);
    const updateUserProfile = useUserManagementStore((s) => s.updateUserProfile);

    const safeUsers   = Array.isArray(users) ? users : [];
    const currentUser = useAuthStore((s) => s.user);

    const [search, setSearch]                   = useState("");
    const [roleFilter, setRoleFilter]           = useState("ALL");
    const [page, setPage]                       = useState(1);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedUser, setSelectedUser]       = useState(null);

    const hasFetched = useRef(false);
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => { if (error) showError(error); }, [error]);

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return safeUsers.filter((u) => {
            const fullName = `${u.name || ""} ${u.surname || ""}`.trim().toLowerCase();
            const username = (u.username || "").toLowerCase();
            const matchesSearch = !q || fullName.includes(q) || username.includes(q);
            const matchesRole   = roleFilter === "ALL" || (u.role || "").toUpperCase() === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [safeUsers, search, roleFilter]);

    const totalPages     = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage    = Math.min(page, totalPages);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, currentPage]);

    const handleSaveRole = async (user, newRole) => {
        const res = await updateUserRole(user.id, newRole);
        if (res.success) {
            showSuccess("Rol actualizado correctamente");
            setOpenDetailModal(false);
            setSelectedUser(null);
        } else {
            showError(res.error || "No se pudo actualizar el rol.");
        }
    };

    const handleCreate = async (formData) => {
        try {
            await registerApi(formData);
            showSuccess("Usuario creado. Se envió correo de verificación.");
            await fetchUsers(undefined, { force: true });
            return true;
        } catch (err) {
            showError(err.response?.data?.message || "No se pudo crear el usuario");
            return false;
        }
    };

    const handleSaveProfile = async (user, formData) => {
        const res = await updateUserProfile(user.id, formData);
        if (res.success) {
            showSuccess("Foto de perfil actualizada");
            await fetchUsers(undefined, { force: true });
            return true;
        }
        showError(res.error || "No se pudo actualizar la foto");
        return false;
    };

    if (loading && safeUsers.length === 0) return <Spinner />;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Usuarios</em>
                    </h1>
                </div>
                <button
                    onClick={() => setOpenCreateModal(true)}
                    className="px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nuevo Usuario
                </button>
            </div>

            {/* FILTROS */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar por nombre o username..."
                    className="flex-1 px-4 py-2 text-sm rounded-lg"
                    style={{
                        background: "#1c1a16",
                        border: "1px solid rgba(201,168,76,0.15)",
                        color: "#f0e8d5",
                        outline: "none",
                        minWidth: 200,
                    }}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 text-sm rounded-lg"
                    style={{
                        background: "#1c1a16",
                        border: "1px solid rgba(201,168,76,0.15)",
                        color: "#f0e8d5",
                        outline: "none",
                    }}
                >
                    <option value="ALL">Todos los roles</option>
                    <option value="ADMIN_ROLE">Admin</option>
                    <option value="USER_ROLE">Usuario</option>
                </select>
            </div>

            {/* TABLA */}
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, overflow: "hidden" }}>

                {/* Cabecera */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Nombre</span>
                    <span className="col-span-3">Username</span>
                    <span className="col-span-2">Email</span>
                    <span className="col-span-2">Rol</span>
                    <span className="col-span-1 text-right">Acc.</span>
                </div>

                {paginatedUsers.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>Sin usuarios registrados</p>
                        <p className="text-xs mt-1">Crea el primero para comenzar</p>
                    </div>
                ) : (
                    paginatedUsers.map((u, index) => {
                        const roleInfo = ROLE_STYLE[u.role] || ROLE_STYLE.USER_ROLE;
                        return (
                            <div
                                key={u.id}
                                className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                                style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>
                                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                                </span>

                                <div className="col-span-3 pr-2">
                                    <p className="text-sm font-medium truncate" style={{ color: "#c9a84c" }}>
                                        {[u.name, u.surname].filter(Boolean).join(" ") || "—"}
                                    </p>
                                </div>

                                <span className="col-span-3 text-sm truncate pr-2" style={{ color: "#9a8e74" }}>
                                    @{u.username}
                                </span>

                                <span className="col-span-2 text-xs truncate pr-2" style={{ color: "#9a8e74" }}>
                                    {u.email || "—"}
                                </span>

                                <span className="col-span-2">
                                    <span className="px-2 py-1 rounded text-xs"
                                        style={{ background: roleInfo.bg, color: roleInfo.color, border: `1px solid ${roleInfo.border}` }}>
                                        {roleInfo.label}
                                    </span>
                                </span>

                                <div className="col-span-1 flex justify-end">
                                    <button
                                        onClick={() => { setSelectedUser(u); setOpenDetailModal(true); }}
                                        className="px-2 py-1 rounded text-xs"
                                        style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-xs" style={{ color: "#5a5040" }}>
                        Mostrando {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
                        {" – "}
                        {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
                    </p>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded text-xs disabled:opacity-30"
                            style={{ background: "#1c1a16", color: "#9a8e74", border: "1px solid rgba(201,168,76,0.15)" }}
                        >
                            Anterior
                        </button>
                        <span className="text-xs" style={{ color: "#5a5040" }}>{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded text-xs disabled:opacity-30"
                            style={{ background: "#1c1a16", color: "#9a8e74", border: "1px solid rgba(201,168,76,0.15)" }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            <CreateUserModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreate={handleCreate}
                loading={loading}
                error={error}
            />
            <UserDetailModal
                key={selectedUser?.id || "no-user"}
                isOpen={openDetailModal}
                onClose={() => { setOpenDetailModal(false); setSelectedUser(null); }}
                user={selectedUser}
                loading={loading}
                onSaveRole={handleSaveRole}
                onSaveProfile={handleSaveProfile}
                currentUserId={currentUser?.id}
            />
        </div>
    );
};