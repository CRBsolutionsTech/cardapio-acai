/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}"],
    theme: {
        fontFamily: {
            'sans': ['Roboto', 'sans-serif'],
        },
        extend: {
            backgroundImage: {
                "home": "url('/assets/logo.jpeg')",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'), // Apenas um exemplo de plugin, se necessário
    ],
}
