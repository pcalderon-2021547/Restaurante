using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class UpdateUserProfileDto
{
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? Phone { get; set; }
    public bool RemovePhoto { get; set; }
    public IFileData? ProfilePicture { get; set; }
}
