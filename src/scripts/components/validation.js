export const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const showInputError = (formElement, inputElement, errorMessage, config) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.add(config.inputErrorClass);
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
  }
};

const hideInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.remove(config.inputErrorClass);
  if (errorElement) {
    errorElement.classList.remove(config.errorClass);
    errorElement.textContent = "";
  }
};

const checkInputValidity = (formElement, inputElement, config) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, config);
  } else {
    let errorMessage = inputElement.validationMessage;
    if (inputElement.type === "text" && (inputElement.id === "name" || inputElement.id === "place-name")) {
      const value = inputElement.value;
      const regex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
      if (!regex.test(value) && value.length > 0) {
        errorMessage = "Разрешены только латиница, кириллица, дефис и пробелы";
      } else if (value.length < 2) {
        errorMessage = "Минимум 2 символа";
      } else if (value.length > (inputElement.id === "name" ? 40 : 30)) {
        errorMessage = `Максимум ${inputElement.id === "name" ? 40 : 30} символов`;
      }
    }
    showInputError(formElement, inputElement, errorMessage, config);
  }
};

const hasInvalidInput = (inputList) => inputList.some((input) => !input.validity.valid);

const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    buttonElement.classList.add(config.inactiveButtonClass);
    buttonElement.disabled = true;
  } else {
    buttonElement.classList.remove(config.inactiveButtonClass);
    buttonElement.disabled = false;
  }
};

const setEventListeners = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  toggleButtonState(inputList, buttonElement, config);
  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

export const enableValidation = (config) => {
  document.querySelectorAll(config.formSelector).forEach((formElement) => {
    setEventListeners(formElement, config);
  });
};

export const clearValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  inputList.forEach((input) => hideInputError(formElement, input, config));
  buttonElement.classList.add(config.inactiveButtonClass);
  buttonElement.disabled = true;
};
