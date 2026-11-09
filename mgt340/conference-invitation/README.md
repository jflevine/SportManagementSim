# The Conference Invitation

Static MGT 340 classroom activity. Open `index.html` through an HTTP server; the app uses ES modules. `?guide=1` opens the instructor guide.

All institutions, offers, and reactions are fictional. No API keys, backend, tracking, or automated grading. Responses save in localStorage when available; a text download and print/PDF preserve the final recommendation.

Decision-sensitive authored reaction pools have three variants per role and recommendation. A random session seed keeps wording stable within an attempt. Briefing selections trigger explanations; the selected priority triggers a reminder. Facts and financial figures never vary by seed. An unchanged decision may yield a different external perspective at the final stage because a different stakeholder speaks.

Run unit checks with `node --test logic.test.mjs`. Serve locally with `python3 -m http.server 8765` from this directory. Test the student flow, save/resume, follow-ups, changes of decision, download, narrow-screen layout, and the guide before publication.
