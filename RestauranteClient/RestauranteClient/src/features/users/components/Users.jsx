import { useEffect, useMemo, useState } from "react"
import { useUserManagementStore } from "../store/useUserManagmentStore.js"
import { Spinner } from "../../../shared/components/layout/Spinner.jsx"
import { showError, showSuccess } from "../../../shared/utils/toast.js"
import { CreateUserModal } from "./CreateUserModal.jsx"
import { useAuthStore } from "../../auth/store/authStore.js"
import { UserDetailModal } from "./UserDetailModal.jsx"
import { updateUserRole } from "../../../shared/api/index.js"

const PAGE_SIZE = 8;

export const Users = () => {

    const { users, loading, error, fetchUsers, updateUserRole } = useUserManagementStore();
    const registerUser = useAuthStore((state) => state.register);
    const currentUser = useAuthStore((state) => state.user)

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers])

    useEffect(() => {
        if (error) {
            showError(error);
        }
    }, [error])

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return users.filter((u) => {
            const fullName = `${u.name || ""} ${u.surname || ""}`
                .trim()
                .toLowerCase();

            const username = (u.username || "").toLowerCase();
            const role = (u.role || "").toUpperCase();

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                username.includes(normalizedSearch);

            const matchesRole =
                roleFilter === "ALL" ? true : role === roleFilter.toUpperCase();

            return matchesRole && matchesSearch
        })
    }, [users, search, roleFilter])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return filteredUsers.slice(start, start + PAGE_SIZE)
    })

    const handleSaveRole = async (user, newRole) => {
        const res = await updateUserRole(user.id, newRole);
        if (res.success) {
            showSuccess("Rol actualizado correctamente")
            setOpenDetailModal(false);
            setSelectedUser(null);
        } else {
            showError(res.error || "No se pudo actualizar el rol.")
        }
    }

    const handleOpenDetail = (user) => {
        setSelectedUser(user)
        setOpenDetailModal(true)
    }

    const handleCreate = async (formData) => {
        const res = await registerUser(formData)
        console.log(res)
        if (res.success) {
            showSuccess("Usuario creado. Se envió correo de verificación.");
            await fetchUsers(undefined, { force: true });
            return true;
        }
        showError(res.error || "No se pudo crear el usuario");
        return false;
    }

    if (loading && users.length === 0) return <Spinner />

    return (
        <div className="p-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-main-blue">Usuarios</h1>
                    <p className="text-gray-500 text-sm">
                        Administra usuarios, consulta su información y cambia su rol
                    </p>
                </div>

                <button
                    className="bg-main-blue px-4 py-2 rounded text-white hover:opacity-90 transition"
                    onClick={() => setOpenCreateModal(true)}
                >
                    + Agregar Usuario
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        placeholder="Buscar por nombre o username..."
                        className="md:col-span-2 w-full px-3 py-2 border rounded-lg"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value)
                            setPage(1)
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="ALL">Todos los roles</option>
                        <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                        <option value="USER_ROLE">USER_ROLE</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">

                        {/* Head */}
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="text-left px-4 py-3">Nombre</th>
                                <th className="text-left px-4 py-3">Username</th>
                                <th className="text-left px-4 py-3">Rol</th>
                                <th className="text-right px-4 py-3">Acciones</th>
                            </tr>
                        </thead>

                        {/* Body (datos de ejemplo) */}
                        <tbody>
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-4 py-6 text-center text-gray-500"
                                        colSpan={4}
                                    >
                                        No hay usuarios para mostrar.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <tr key={u.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {[u.name, u.surname].filter(Boolean).join(" ") || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            @{u.username}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === "ADMIN_ROLE"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                className="px-3 py-1.5 rounded-lg bg-main-blue text-white text-xs font-semibold hover:opacity-90"
                                                onClick={() => handleOpenDetail(u)}
                                            >
                                                Ver / Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                    <p className="text-xs text-gray-600">
                        Mostando {" "}
                        {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
                        {" - "}
                        {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de{" "}
                        {filteredUsers.length}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded border bg-white text-sm"
                        >
                            Anterior
                        </button>

                        <span className="px-2 py-1.5 text-sm text-gray-700">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded border bg-white text-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

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
                onClose={() => {
                    setOpenDetailModal(false)
                    setSelectedUser(null);
                }}
                user={selectedUser}
                loading={loading}
                onSaveRole={handleSaveRole}
                currentUserId={currentUser?.id}
            />
        </div>
    );
}
