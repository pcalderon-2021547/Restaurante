namespace AuthService.Application.DTOs;

public class UpdateUserRoleDto
{
    // Single role per user; accept role name like "ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE" or "USER_ROLE"
    public string RoleName { get; set; } = string.Empty;
}
