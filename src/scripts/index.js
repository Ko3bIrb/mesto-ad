import "../pages/index.css";

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModal, closeModal, setupModalClosers } from "./components/modal.js";
import { enableValidation, clearValidation, validationConfig } from "./components/validation.js";

// ===== DOM ЭЛЕМЕНТЫ =====
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");

const editProfileModal = document.querySelector(".popup_type_edit");
const editProfileForm = editProfileModal?.querySelector(".popup__form");
const nameInput = editProfileModal?.querySelector(".popup__input_type_name");
const jobInput = editProfileModal?.querySelector(".popup__input_type_description");
const editProfileSubmitBtn = editProfileForm?.querySelector(".popup__button");

const editAvatarModal = document.querySelector(".popup_type_edit-avatar");
const editAvatarForm = editAvatarModal?.querySelector(".popup__form");
const avatarInput = editAvatarModal?.querySelector(".popup__input");
const editAvatarSubmitBtn = editAvatarForm?.querySelector(".popup__button");

const addCardModal = document.querySelector(".popup_type_new-card");
const addCardForm = addCardModal?.querySelector(".popup__form");
const cardNameInput = addCardModal?.querySelector(".popup__input_type_card-name");
const cardLinkInput = addCardModal?.querySelector(".popup__input_type_url");
const addCardSubmitBtn = addCardForm?.querySelector(".popup__button");

const cardContainer = document.querySelector(".places__list");

const imageModal = document.querySelector(".popup_type_image");
const imageModalImg = imageModal?.querySelector(".popup__image");
const imageModalCaption = imageModal?.querySelector(".popup__caption");

const infoModal = document.querySelector(".popup_type_info");
const infoModalList = infoModal?.querySelector(".popup__info");
const infoModalTemplate = document.querySelector("#popup-info-definition-template");
const userInfoTemplate = document.querySelector("#popup-info-user-preview-template");

const confirmDeleteModal = document.querySelector(".popup_type_remove-card");
const confirmDeleteForm = confirmDeleteModal?.querySelector(".popup__form");

// ===== ПЕРЕМЕННЫЕ =====
let currentUserId = null;
let cardToDelete = null;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const renderLoading = (button, isLoading, defaultText, loadingText = "Сохранение...") => {
  if (!button) return;
  button.textContent = isLoading ? loadingText : defaultText;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
};

// ===== ОБРАБОТЧИКИ =====
const handleImageClick = (name, link) => {
  if (imageModalImg) imageModalImg.src = link;
  if (imageModalImg) imageModalImg.alt = name;
  if (imageModalCaption) imageModalCaption.textContent = name;
  if (imageModal) openModal(imageModal);
};

const handleLikeClick = async (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  try {
    const updatedCard = await changeLikeCardStatus(cardId, isLiked);
    likeCount.textContent = updatedCard.likes.length;
    likeButton.classList.toggle("card__like-button_is-active");
  } catch (err) {
    console.error("Ошибка при лайке:", err);
  }
};

// Удаление через модальное окно (без confirm)
const handleDeleteClick = (cardId, cardElement) => {
  cardToDelete = { cardId, cardElement };
  openModal(confirmDeleteModal);
};

const handleConfirmDelete = async (evt) => {
  evt.preventDefault();
  if (!cardToDelete) return;
  
  const submitButton = confirmDeleteForm?.querySelector(".popup__button");
  const originalText = submitButton?.textContent || "Да";
  
  if (submitButton) submitButton.textContent = "Удаление...";
  
  try {
    await deleteCard(cardToDelete.cardId);
    // Удаляем карточку со страницы
    if (cardToDelete.cardElement && cardToDelete.cardElement.remove) {
      cardToDelete.cardElement.remove();
    }
    closeModal(confirmDeleteModal);
    cardToDelete = null;
  } catch (err) {
    console.error("Ошибка при удалении:", err);
  } finally {
    if (submitButton) submitButton.textContent = originalText;
  }
};

// Статистика карточки
const handleInfoClick = async (cardId) => {
  if (!infoModal || !infoModalList) return;
  try {
    const cards = await getCardList();
    const cardData = cards.find(card => card._id === cardId);
    if (!cardData) return;

    infoModalList.innerHTML = "";

    const createInfoRow = (label, value) => {
      const template = infoModalTemplate?.content.cloneNode(true);
      if (!template) return null;
      const term = template.querySelector(".popup__info-term");
      const desc = template.querySelector(".popup__info-description");
      if (term) term.textContent = label;
      if (desc) desc.textContent = value;
      return template;
    };

    // Добавляем строки информации
    infoModalList.appendChild(createInfoRow("Описание:", cardData.name));
    infoModalList.appendChild(createInfoRow("Дата создания:", formatDate(cardData.createdAt)));
    infoModalList.appendChild(createInfoRow("Владелец:", cardData.owner.name));
    infoModalList.appendChild(createInfoRow("Количество лайков:", cardData.likes.length));

    // Очищаем и заполняем список лайкнувших
    const popupList = document.querySelector(".popup__list");
    if (popupList) {
      popupList.innerHTML = "";
      
      cardData.likes.forEach(user => {
        const template = userInfoTemplate?.content.cloneNode(true);
        if (template) {
          const nameElement = template.querySelector(".popup__list-item");
          if (nameElement) nameElement.textContent = user.name;
          popupList.appendChild(template);
        }
      });
    }

    openModal(infoModal);
  } catch (err) {
    console.error("Ошибка загрузки статистики:", err);
  }
};

// ===== ОБРАБОТЧИКИ ФОРМ =====
const handleProfileFormSubmit = async (evt) => {
  evt.preventDefault();
  const defaultText = editProfileSubmitBtn?.textContent || "Сохранить";
  renderLoading(editProfileSubmitBtn, true, defaultText);
  try {
    const userData = await setUserInfo(nameInput.value, jobInput.value);
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModal(editProfileModal);
  } catch (err) {
    console.error("Ошибка обновления профиля:", err);
  } finally {
    renderLoading(editProfileSubmitBtn, false, defaultText);
  }
};

const handleAvatarFormSubmit = async (evt) => {
  evt.preventDefault();
  const defaultText = editAvatarSubmitBtn?.textContent || "Сохранить";
  renderLoading(editAvatarSubmitBtn, true, defaultText);
  try {
    const userData = await setUserAvatar(avatarInput.value);
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    closeModal(editAvatarModal);
    avatarInput.value = "";
    clearValidation(editAvatarForm, validationConfig);
  } catch (err) {
    console.error("Ошибка обновления аватара:", err);
  } finally {
    renderLoading(editAvatarSubmitBtn, false, defaultText);
  }
};

const handleAddCardSubmit = async (evt) => {
  evt.preventDefault();
  const defaultText = addCardSubmitBtn?.textContent || "Создать";
  renderLoading(addCardSubmitBtn, true, defaultText, "Создание...");
  try {
    const newCard = await addCard(cardNameInput.value, cardLinkInput.value);
    const cardElement = createCardElement(newCard, currentUserId, {
      handleImageClick,
      handleDeleteClick,
      handleLikeClick,
      handleInfoClick,
    });
    cardContainer.prepend(cardElement);
    closeModal(addCardModal);
    addCardForm.reset();
    clearValidation(addCardForm, validationConfig);
  } catch (err) {
    console.error("Ошибка добавления карточки:", err);
  } finally {
    renderLoading(addCardSubmitBtn, false, defaultText, "Создать");
  }
};

// ===== НАСТРОЙКА СЛУШАТЕЛЕЙ =====
const setupFormHandlers = () => {
  if (editProfileForm) editProfileForm.addEventListener("submit", handleProfileFormSubmit);
  if (editAvatarForm) editAvatarForm.addEventListener("submit", handleAvatarFormSubmit);
  if (addCardForm) addCardForm.addEventListener("submit", handleAddCardSubmit);
  if (confirmDeleteForm) confirmDeleteForm.addEventListener("submit", handleConfirmDelete);

  if (profileEditButton) {
    profileEditButton.addEventListener("click", () => {
      nameInput.value = profileTitle.textContent;
      jobInput.value = profileDescription.textContent;
      clearValidation(editProfileForm, validationConfig);
      openModal(editProfileModal);
    });
  }

  if (profileAvatar) {
    profileAvatar.addEventListener("click", () => {
      avatarInput.value = "";
      clearValidation(editAvatarForm, validationConfig);
      openModal(editAvatarModal);
    });
  }

  if (profileAddButton) {
    profileAddButton.addEventListener("click", () => {
      addCardForm.reset();
      clearValidation(addCardForm, validationConfig);
      openModal(addCardModal);
    });
  }
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
const initializeApp = async () => {
  try {
    const [cards, userData] = await Promise.all([getCardList(), getUserInfo()]);
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach(card => {
      const cardElement = createCardElement(card, currentUserId, {
        handleImageClick,
        handleDeleteClick,
        handleLikeClick,
        handleInfoClick,
      });
      cardContainer.appendChild(cardElement);
    });
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
};

// ===== ЗАПУСК =====
enableValidation(validationConfig);
setupModalClosers();
setupFormHandlers();
initializeApp();