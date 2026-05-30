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

// ===== ПЕРЕМЕННЫЕ =====
let currentUserId = null;

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

const handleDeleteClick = async (cardId, cardElement) => {
  if (!confirm("Вы уверены, что хотите удалить карточку?")) return;
  try {
    await deleteCard(cardId);
    cardElement.remove();
  } catch (err) {
    console.error("Ошибка при удалении:", err);
  }
};

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

    const createUserItem = (user) => {
      const template = userInfoTemplate?.content.cloneNode(true);
      if (!template) return null;
      const nameElement = template.querySelector(".popup__list-item");
      if (nameElement) nameElement.textContent = user.name;
      return template;
    };

    infoModalList.appendChild(createInfoRow("Название:", cardData.name));
    infoModalList.appendChild(createInfoRow("Дата создания:", formatDate(cardData.createdAt)));
    infoModalList.appendChild(createInfoRow("Автор:", cardData.owner.name));
    infoModalList.appendChild(createInfoRow("Лайков:", cardData.likes.length));

    if (cardData.likes.length > 0) {
      infoModalList.appendChild(createInfoRow("Кто лайкнул:", ""));
      cardData.likes.forEach(user => {
        const userItem = createUserItem(user);
        if (userItem) infoModalList.appendChild(userItem);
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
