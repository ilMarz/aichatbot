-- Seed default suggested questions
INSERT INTO "Settings" ("key", "value")
VALUES ('suggested_questions', '["Come posso aiutarti oggi?","Hai domande su qualcosa di specifico?","Vuoi che ti spieghi qualcosa?","Come posso semplificarti la giornata?"]')
ON CONFLICT ("key") DO NOTHING;
