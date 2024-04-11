import userServiceContainer from "../services/UserService";
import User from "../model/User";

jest.mock('../model/User');

describe('UserService', () => {
    let userService = userServiceContainer.resolve("userService");

    describe('registration', () => {
        it('should register a new user', async () => {
            // Mock dependencies and setup necessary data
            const email = 'test@example.com';
            const name = 'John';
            const surname = 'Doe';
            const password = 'password';

            // Mock User.findOne to return null (no existing user with the same email)
            User.findOne({email : email}).mockResolvedValue(null);

            // Mock User.create to return the new user
            const mockUser = { email, name, surname, _id: 'someUserId' };
            User.create.mockResolvedValue(mockUser);

            // Call the registration method
            const result = await userService.registration(email, name, surname, password);

            // Assert the result
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
            expect(result.user.email).toBe(email);
            expect(result.user.name).toBe(name);
            expect(result.user.surname).toBe(surname);
        });
    });
});

describe('UserService', () => {
    let userService = userServiceContainer.resolve("userService");

    // Existing tests...

    describe('login', () => {
        it('should log in an existing user', async () => {
            const email = 'test@example.com';
            const password = 'password';
            const mockUser = { email, password: await bcrypt.hash(password, 10), _id: 'someUserId' };

            User.findOne.mockResolvedValue(mockUser);

            const result = await userService.login(email, password);

            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
            expect(result.user.email).toBe(email);
        });

        it('should not log in non-existing user', async () => {
            const email = 'test@example.com';
            const password = 'password';

            User.findOne.mockResolvedValue(null);

            await expect(userService.login(email, password)).rejects.toThrow();
        });

        it('should not log in with wrong password', async () => {
            const email = 'test@example.com';
            const password = 'password';
            const mockUser = { email, password: await bcrypt.hash('wrong-password', 10), _id: 'someUserId' };

            User.findOne.mockResolvedValue(mockUser);

            await expect(userService.login(email, password)).rejects.toThrow();
        });
    });

    describe('changePassword', () => {
        it('should change password for existing user', async () => {
            const id = 'someUserId';
            const password = 'new-password';
            const mockUser = { _id: id, password: await bcrypt.hash('old-password', 10), save: jest.fn() };

            User.findById.mockResolvedValue(mockUser);

            const result = await userService.changePassword(id, password);

            expect(result).toBeDefined();
            expect(result._id).toBe(id);
            expect(await bcrypt.compare(password, result.password)).toBe(true);
        });

        it('should not change password for non-existing user', async () => {
            const id = 'someUserId';
            const password = 'new-password';

            User.findById.mockResolvedValue(null);

            await expect(userService.changePassword(id, password)).rejects.toThrow();
        });
    });

    describe('deleteUser', () => {
        it('should delete existing user', async () => {
            const id = 'someUserId';
            const mockUser = { _id: id, deleteOne: jest.fn() };

            User.findById.mockResolvedValue(mockUser);

            await userService.deleteUser(id);

            expect(mockUser.deleteOne).toHaveBeenCalled();
        });

        it('should not delete non-existing user', async () => {
            const id = 'someUserId';

            User.findById.mockResolvedValue(null);

            await expect(userService.deleteUser(id)).rejects.toThrow();
        });
    });
});