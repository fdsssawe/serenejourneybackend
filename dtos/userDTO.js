export default class UserDto {
    email;
    id;
    isActicated;


    constructor(model) {
        this.email = model.email
        this.id = model._id
        this.name = model.name
        this.surname = model.surname
        this.isActicated = model.isActicated
    }
}