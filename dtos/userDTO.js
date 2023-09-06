export default class UserDto {
    email;
    id;
    isActivated;
    name;
    surname;
    isAdmin;


    constructor(model) {
        this.email = model.email
        this.id = model._id
        this.name = model.name
        this.surname = model.surname
        this.isActivated = model.isActivated
        this.isAdmin = model.isAdmin
    }
}