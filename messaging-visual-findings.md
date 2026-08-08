# Messaging visual verification

- Desktop `/messages` renders a true no-selection state with the membership-backed inbox sidebar, search input, filter tabs, empty conversation state, and centered “Luna Social Messages” prompt.
- `/messages/1` correctly resolves to the same no-selection state when the signed-in user is not a member of conversation 1, preventing unauthorized history access.
- The visual system remains consistent with Luna Social’s nocturnal purple palette and the empty state is readable at 1280×720.
- A mobile-width capture remains to be taken after this desktop verification.

At 390×844, `/messages` keeps the Messages heading, new-message control, search field, and All/Unread/Groups filters visible. The chat panel is correctly hidden in the no-selection mobile state, leaving the inbox controls accessible.
