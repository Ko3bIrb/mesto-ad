import { changeLikeCardStatus } from "./api.js";

// Проверяет, лайкнута ли карточка текущим пользователем
export const isCardLiked = (cardData, currentUserId) => {
  return cardData.likes.some(user => user._id === currentUserId);
};

// Обновляет состояние лайка и счётчик на карточке
export const updateLikeState = (likeButton, likeCount, updatedCard) => {
  likeCount.textContent = updatedCard.likes.length;
  likeButton.classList.toggle("card__like-button_is-active");
};

// Удаляет карточку из DOM
export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export function createCardElement(cardData, currentUserId, { handleImageClick, handleDeleteClick, handleInfoClick }) {
  const cardTemplate = document.querySelector("#card-template").content;
  const cardFragment = cardTemplate.cloneNode(true);
  const cardElement = cardFragment.querySelector(".card");

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  // Устанавливаем состояние лайка
  if (isCardLiked(cardData, currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Обработчик лайка (вся логика внутри card.js)
  likeButton.addEventListener("click", async () => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");
    try {
      const updatedCard = await changeLikeCardStatus(cardData._id, isLiked);
      updateLikeState(likeButton, likeCount, updatedCard);
      cardData.likes = updatedCard.likes;
    } catch (err) {
      console.error("Ошибка при лайке:", err);
    }
  });

  // Кнопка удаления (только для своих карточек)
  if (cardData.owner._id !== currentUserId) {
    if (deleteButton) deleteButton.remove();
  } else if (deleteButton) {
    deleteButton.addEventListener("click", () => handleDeleteClick(cardData._id, cardElement));
  }

  // Кнопка информации
  if (infoButton) {
    infoButton.addEventListener("click", () => handleInfoClick(cardData._id));
  }

  // Открытие изображения
  cardImage.addEventListener("click", () => handleImageClick(cardData.name, cardData.link));

  return cardElement;
}