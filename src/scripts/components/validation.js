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
  // Сначала проверяем стандартную браузерную валидацию
  let isInvalid = false;
  let errorMessage = "";
  
  // Проверка на минимальную длину для названия карточки
  if (inputElement.id === "place-name") {
    const value = inputElement.value;
    if (value.length < 2) {
      isInvalid = true;
      errorMessage = "Минимум 2 символа";
    } else if (value.length > 30) {
      isInvalid = true;
      errorMessage = "Максимум 30 символов";
    } else {
      const regex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
      if (!regex.test(value) && value.length > 0) {
        isInvalid = true;
        errorMessage = "Разрешены только латиница, кириллица, дефис и пробелы";
      }
    }
  }
  
  // Проверка на минимальную длину для имени пользователя
  if (inputElement.id === "user-name") {
    const value = inputElement.value;
    if (value.length < 2) {
      isInvalid = true;
      errorMessage = "Минимум 2 символа";
    } else if (value.length > 40) {
      isInvalid = true;
      errorMessage = "Максимум 40 символов";
    } else {
      const regex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
      if (!regex.test(value) && value.length > 0) {
        isInvalid = true;
        errorMessage = "Разрешены только латиница, кириллица, дефис и пробелы";
      }
    }
  }
  
  // Проверка для поля ссылки
  if (inputElement.id === "place-link" || inputElement.id === "user-avatar") {
    if (!inputElement.validity.valid) {
      isInvalid = true;
      errorMessage = inputElement.validationMessage || "Введите корректный URL";
    }
  }
  
  // Проверка для описания
  if (inputElement.id === "user-description") {
    const value = inputElement.value;
    if (value.length < 2) {
      isInvalid = true;
      errorMessage = "Минимум 2 символа";
    } else if (value.length > 200) {
      isInvalid = true;
      errorMessage = "Максимум 200 символов";
    }
  }
  
  if (isInvalid) {
    showInputError(formElement, inputElement, errorMessage, config);
  } else {
    hideInputError(formElement, inputElement, config);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => {
    // Проверяем каждое поле на валидность
    if (inputElement.id === "place-name") {
      const value = inputElement.value;
      return value.length < 2 || value.length > 30 || !/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(value);
    }
    if (inputElement.id === "user-name") {
      const value = inputElement.value;
      return value.length < 2 || value.length > 40 || !/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(value);
    }
    if (inputElement.id === "place-link" || inputElement.id === "user-avatar") {
      return !inputElement.validity.valid;
    }
    if (inputElement.id === "user-description") {
      const value = inputElement.value;
      return value.length < 2 || value.length > 200;
    }
    return !inputElement.validity.valid;
  });
};

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