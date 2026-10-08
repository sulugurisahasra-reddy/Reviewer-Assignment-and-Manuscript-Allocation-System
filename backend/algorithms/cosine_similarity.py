
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as calculate_similarity


def cosine_similarity(text1, text2):
    """
    Calculate cosine similarity between two text descriptions.
    Return a score between 0 and 1.
    """
    if not text1 or not text2:
        return 0.0

    text1 = text1.strip()
    text2 = text2.strip()

    if not text1 or not text2:
        return 0.0

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([text1, text2])

    score = calculate_similarity(vectors[0:1], vectors[1:2])[0][0]

    return round(float(score), 4)