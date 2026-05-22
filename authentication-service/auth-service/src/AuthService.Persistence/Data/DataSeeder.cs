using AuthService.Domain.Entities;
using AuthService.Application.Services;
using AuthService.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var roleSet = context.Roles ?? throw new InvalidOperationException("Roles DbSet is null.");
        var requiredRoles = new[]
        {
            RoleConstants.ADMIN_ROLE,
            RoleConstants.ADMIN_RESTAURANT_ROLE,
            RoleConstants.USER_ROLE
        };

        foreach (var roleName in requiredRoles)
        {
            if (!await roleSet.AnyAsync(r => r.Name == roleName))
            {
                await roleSet.AddAsync(new Role
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = roleName
                });
            }
        }

        if (context.ChangeTracker.HasChanges())
        {
            await context.SaveChangesAsync();
        }

        // Seed de un usuario administrador por defecto SOLO si no existen usuarios todavía
        if (!(await (context.Users?.AnyAsync() ?? Task.FromResult(false))))
        {
            // Buscar rol admin existente
            var adminRole = await roleSet.FirstOrDefaultAsync(r => r.Name == RoleConstants.ADMIN_ROLE);
            if (adminRole != null)
            {
                var passwordHasher = new PasswordHashService();

                var userId = UuidGenerator.GenerateUserId();
                var profileId = UuidGenerator.GenerateUserId();
                var emailId = UuidGenerator.GenerateUserId();
                var userRoleId = UuidGenerator.GenerateUserId();

                var adminUser = new User
                {
                    Id = userId,
                    Name = "Admin",
                    Surname = "User",
                    Username = "admin",
                    Email = "admin@ksports.local",
                    Password = passwordHasher.HashPassword("Admin1234!"),
                    Status = true,
                    UserProfile = new UserProfile
                    {
                        Id = profileId,
                        UserId = userId,
                        ProfilePicture = string.Empty,
                        Phone = string.Empty
                    },
                    UserEmail = new UserEmail
                    {
                        Id = emailId,
                        UserId = userId,
                        EmailVerified = true,
                        EmailVerificationToken = null,
                        EmailVerificationTokenExpiry = null
                    },
                    UserRoles =
                    [
                        new UserRole
                        {
                            Id = userRoleId,
                            UserId = userId,
                            RoleId = adminRole.Id
                        }
                    ]
                };

                await context.Users!.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
