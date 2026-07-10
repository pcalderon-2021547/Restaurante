import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: vi.fn().mockResolvedValue(true) })
  }
}));

const fakeUsers = {};
const makeUser = (data) => {
  const user = { ...data };
  user.update = async (payload) => {
    Object.assign(user, payload);
    return user;
  };
  user.toJSON = () => ({ ...user });
  return user;
};
let ctrl;
let cloudinaryModule;
let User;

beforeEach(async () => {
  vi.restoreAllMocks();
  process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
  process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
  process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';
  process.env.CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'auth_service/profiles';
  process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME = process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME || 'default-avatar.png';

  cloudinaryModule = await import('../../../../helpers/cloudinary.service.js');
  User = (await import('../../user/user.js')).default;

  vi.spyOn(cloudinaryModule, 'uploadImage').mockResolvedValue('auth_service/profiles/profile-123');
  vi.spyOn(cloudinaryModule, 'deleteImage').mockResolvedValue(true);
  vi.spyOn(cloudinaryModule, 'getFullImageUrl').mockImplementation((id) => (id?.startsWith('http') ? id : `https://res.cloudinary.com/${id}`));
  vi.spyOn(cloudinaryModule, 'getDefaultAvatarUrl').mockReturnValue('https://res.cloudinary.com/default/avatar.png');

  vi.spyOn(User, 'create').mockImplementation(async (data) => {
    const id = data.email || 'uid';
    const user = makeUser({ id, ...data });
    fakeUsers[id] = user;
    return user;
  });
  vi.spyOn(User, 'findByPk').mockImplementation(async (id) => fakeUsers[id] || null);
  vi.spyOn(User, 'findOne').mockImplementation(async ({ where }) => {
    const user = Object.values(fakeUsers).find(u => u.email === where.email);
    return user || null;
  });
  vi.spyOn(User, 'count').mockImplementation(async () => Object.keys(fakeUsers).length);

  Object.keys(fakeUsers).forEach(k => delete fakeUsers[k]);
  ctrl = await import('../auth.controller.js');
});

describe('Auth profile flows (unit)', () => {
  it('Registro sin foto -> usa avatar por defecto', async () => {
    const req = { body: { name: 'A', surname: 'B', username: 'u', email: 'no-photo@example.com', password: 'P' }, file: undefined };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await ctrl.register(req, res);

  expect(User.create).toHaveBeenCalled();
    const created = fakeUsers['no-photo@example.com'];
    expect(created).toBeTruthy();
    // avatar debe haberse fijado al default (getDefaultAvatarUrl mock retorna URL)
    expect(created.avatar).toBe('https://res.cloudinary.com/default/avatar.png');
  });

  it('Registro con file -> sube a cloudinary y guarda public_id', async () => {
    // Simular que uploadImage devuelve 'auth_service/profiles/profile-123'
  cloudinaryModule.uploadImage.mockResolvedValue('auth_service/profiles/profile-123');

    const req = { body: { name: 'A', surname: 'B', username: 'u', email: 'photo@example.com', password: 'P' }, file: { path: '/tmp/somefile' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await ctrl.register(req, res);

    const created = fakeUsers['photo@example.com'];
    expect(created).toBeTruthy();
    expect(created.avatar).toBe('auth_service/profiles/profile-123');
  });

  it('Update con nueva foto -> sube nueva y borra anterior Cloudinary', async () => {
    // Preparar usuario existente con avatar de Cloudinary
  fakeUsers['upd@example.com'] = makeUser({ id: 'upd@example.com', email: 'upd@example.com', avatar: 'auth_service/profiles/old' });
  cloudinaryModule.uploadImage.mockResolvedValue('auth_service/profiles/new');
  cloudinaryModule.deleteImage.mockResolvedValue(true);

    // Crear req con file y token middleware simulada
    const req = { user: { id: 'upd@example.com' }, file: { path: '/tmp/newfile' }, body: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await ctrl.updateProfile(req, res);

  expect(cloudinaryModule.uploadImage).toHaveBeenCalled();
  expect(cloudinaryModule.deleteImage).toHaveBeenCalledWith('auth_service/profiles/old');
    const updated = fakeUsers['upd@example.com'];
    expect(updated.avatar).toBe('auth_service/profiles/new');
  });

  it('Update con removePhoto=true -> borra en cloudinary y aplica default', async () => {
  fakeUsers['rm@example.com'] = makeUser({ id: 'rm@example.com', email: 'rm@example.com', avatar: 'auth_service/profiles/old' });
  cloudinaryModule.deleteImage.mockResolvedValue(true);

    const req = { user: { id: 'rm@example.com' }, body: { removePhoto: '1' }, file: undefined };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await ctrl.updateProfile(req, res);

  expect(cloudinaryModule.deleteImage).toHaveBeenCalledWith('auth_service/profiles/old');
    const updated = fakeUsers['rm@example.com'];
    // default mock defined earlier
    expect(updated.avatar).toBe('https://res.cloudinary.com/default/avatar.png');
  });
});
