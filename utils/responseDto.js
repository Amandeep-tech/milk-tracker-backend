class ResponseDto {
    constructor(data = null, error = 0, message = '') {
        this.error = error;
        this.data = data;
        this.message = message;
    }

    static success(data = null, message = 'Success') {
        return new ResponseDto(data, 0, message);
    }

    static error(message = 'An error occurred', error = 1) {
        return new ResponseDto(null, error, message);
    }
}

module.exports = ResponseDto; 