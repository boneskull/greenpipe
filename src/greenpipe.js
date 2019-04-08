export const greenpipe = async (...args) => args.reduce((acc, arg) => arg(acc));
