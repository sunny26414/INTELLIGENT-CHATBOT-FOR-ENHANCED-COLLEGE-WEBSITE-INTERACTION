const SuggestionsButton = ({ text, onClick }) => {
    return (
        <button className="suggestions-button" onClick={onClick}>{text}</button>
    )
}

export default SuggestionsButton;