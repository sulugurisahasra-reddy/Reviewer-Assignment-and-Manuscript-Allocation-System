
def compute_lps(pattern):
    """
    Compute the Longest Prefix Suffix (LPS) array.
    """
    m = len(pattern)
    lps = [0] * m

    length = 0
    i = 1

    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1

    return lps


def kmp_search(text, pattern):
    """
    Find all occurrences of pattern in text using KMP.
    Return the starting indices of matches.
    """
    if not pattern:
        return []

    n = len(text)
    m = len(pattern)

    lps = compute_lps(pattern)

    i = 0
    j = 0
    matches = []

    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1

        if j == m:
            matches.append(i - j)
            j = lps[j - 1]

        elif i < n and text[i] != pattern[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1

    return matches