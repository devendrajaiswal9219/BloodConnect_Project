const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode=err.statusCode && err.statusCode!==200? err.statusCode:500;

    let message=err.message || "Internal Server Error";
    if(err.name==="CastError"){
        statusCode=404;
        message=`Resource not found with id ${err.value}`;
    }
    if(err.code===11000){
        statusCode=400;
        const field=Object.keys(err.keyValue || {})[0];
        message=`A record with ${field || 'value'} already exists.`;
    }
    if(err.name==="ValidationError"){
        statusCode=400;
        message=Object.values(err.errors).map(val=>val.message).join(", ");
    }
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV==="production" ? null : err.stack,
    });
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: "Route not found : " + req.originalUrl,
    });
}

module.exports = { errorHandler, notFoundHandler };