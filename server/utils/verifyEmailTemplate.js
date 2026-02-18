// utils/verifyEmailTemplate.js
const verifyEmailTemplate = ({ name, url }) => {
  return `
    <h1>Hello ${name}</h1>
    <p>Thank you for registering at our shop.</p>
    <p>Click the link below to verify your email:</p>
    <a href="${url}">Verify Email</a>
  `;
};

export default verifyEmailTemplate;
