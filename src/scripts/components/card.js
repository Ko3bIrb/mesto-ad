export function createCardElement(cardData, currentUserId, { handleImageClick, handleDeleteClick, handleLikeClick, handleInfoClick }) {
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

  const isLikedByMe = cardData.likes.some(user => user._id === currentUserId);
  if (isLikedByMe) likeButton.classList.add("card__like-button_is-active");

  if (cardData.owner._id !== currentUserId) {
    if (deleteButton) deleteButton.remove();
  } else if (deleteButton) {
    deleteButton.addEventListener("click", () => handleDeleteClick(cardData._id, cardElement));
  }

  likeButton.addEventListener("click", () => handleLikeClick(cardData._id, likeButton, likeCount));

  if (infoButton) {
    infoButton.addEventListener("click", () => handleInfoClick(cardData._id));
  }

  cardImage.addEventListener("click", () => handleImageClick(cardData.name, cardData.link));

  return cardElement;
}