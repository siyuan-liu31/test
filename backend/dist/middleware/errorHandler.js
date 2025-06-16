"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    // 操作性错误：发送给客户端
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
        });
    }
    else {
        // 编程错误：不要泄露错误详情
        console.error('ERROR 💥', err);
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
        });
    }
};
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    const message = `重复的字段值: ${value}. 请使用其他值!`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `无效的输入数据. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = () => new AppError('无效的令牌，请重新登录!', 401);
const handleJWTExpiredError = () => new AppError('令牌已过期，请重新登录!', 401);
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError')
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
exports.errorHandler = errorHandler;
// 异步错误处理包装器
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=errorHandler.js.map