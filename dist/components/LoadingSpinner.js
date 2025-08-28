import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LoadingSpinner = () => {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }), _jsx("p", { className: "text-gray-600 font-medium", children: "Loading..." })] }) }));
};
export default LoadingSpinner;
