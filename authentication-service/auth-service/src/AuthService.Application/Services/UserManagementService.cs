using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Application.Validators;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles, ICloudinaryService cloudinary) : IUserManagementService
{
    private static bool IsPublicUrl(string value)
        => !string.IsNullOrWhiteSpace(value) && (value.StartsWith("http://") || value.StartsWith("https://"));

    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use {string.Join(", ", RoleConstants.AllowedRoles)}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);

        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        // Update role using repository method
        await users.UpdateUserRoleAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);

        // Map to response
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = role.Name,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Surname = u.Surname,
            Username = u.Username,
            Email = u.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(u.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = u.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = u.Status,
            IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        }).ToList();
    }

    public async Task<UserResponseDto> UpdateUserProfileAsync(string userId, UpdateUserProfileDto dto)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));

        var user = await users.GetByIdAsync(userId);

        if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Surname)) user.Surname = dto.Surname;
        if (!string.IsNullOrWhiteSpace(dto.Phone)) user.UserProfile.Phone = dto.Phone;

        var currentProfilePicture = user.UserProfile.ProfilePicture ?? string.Empty;

        if (dto.ProfilePicture != null && dto.ProfilePicture.Size > 0)
        {
            var (isValid, errorMessage) = FileValidator.ValidateImage(dto.ProfilePicture);
            if (!isValid)
            {
                throw new InvalidOperationException(errorMessage ?? "Invalid profile image");
            }

            var fileName = FileValidator.GenerateSecureFileName(dto.ProfilePicture.FileName);
            var uploaded = await cloudinary.UploadImageAsync(dto.ProfilePicture, fileName);

            if (!string.IsNullOrWhiteSpace(currentProfilePicture) && !IsPublicUrl(currentProfilePicture))
            {
                await cloudinary.DeleteImageAsync(currentProfilePicture);
            }

            user.UserProfile.ProfilePicture = uploaded;
        }
        else if (dto.RemovePhoto)
        {
            if (!string.IsNullOrWhiteSpace(currentProfilePicture) && !IsPublicUrl(currentProfilePicture))
            {
                await cloudinary.DeleteImageAsync(currentProfilePicture);
            }

            user.UserProfile.ProfilePicture = cloudinary.GetDefaultAvatarUrl();
        }

        user = await users.UpdateAsync(user);

        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.USER_ROLE;
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = userRole,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
