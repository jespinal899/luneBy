SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict z1YBhUdDY7B0cZVb0enG1wib58NwPufGvPgH2V5CZfHCMudf9sHtQdxqkKysWAx

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."services" ("id", "name", "price", "description", "category", "durationMin", "image", "slug", "isActive") VALUES
	('c536aabd-cc48-4754-b0d8-39625292aa2a', 'Manicura ', 350, 'Manicura', 'Manicura', 60, 'https://fxlttpayjkkbfomveavx.supabase.co/storage/v1/object/public/service-images/a6ac24eb-f85a-4c25-a0c8-f9c0548327e1.webp', 'manicura', false),
	('96e94600-fc9c-4ac2-b5a3-930b193950ea', 'Soft gel + Nail Art', 500, NULL, 'Nail Art', 60, 'https://fxlttpayjkkbfomveavx.supabase.co/storage/v1/object/public/service-images/57c8da1c-6d71-4324-bcca-506e7a3b96c1.webp', 'soft-gel-nail-art', false),
	('911e226a-29a4-40a4-b5ea-697ae1cc8b73', 'Manicura + Esmaltado Cat eye', 380, NULL, 'Manicura', 60, 'https://fxlttpayjkkbfomveavx.supabase.co/storage/v1/object/public/service-images/a7707baa-a490-4c1f-8572-e43590eeb12f.webp', 'manicura-esmaltado-cat-eye', false),
	('01846b41-8720-4213-b04f-8a93af75193b', 'Ojo de gato', 150, 'Efecto magnético multidireccional', 'Estilo', 15, NULL, 'estilo-ojo-de-gato', false),
	('25fe04fa-d68e-4297-b3f6-f987157b1458', 'Encapsulado de glitter', 200, 'Brillo o flores encapsuladas en el acrílico', 'Estilo', 25, NULL, 'estilo-encapsulado-glitter', false),
	('c39dddde-0293-4d44-bdd1-9a42404d0b41', 'Efecto espejo / aura', 180, 'Cromado metálico o degradado aura', 'Estilo', 20, NULL, 'estilo-efecto-espejo', false),
	('1c4814f5-3cc4-498b-a205-21f52b17b70d', 'Nail art a mano alzada (por uña)', 90, 'Diseño personalizado pintado a mano, precio por uña', 'Estilo', 10, NULL, 'estilo-nail-art-mano-alzada', false),
	('b9b2a3df-ce8f-45d9-a7a6-a80ca544b225', 'Pedrería y joyas (por uña)', 60, 'Aplicación de cristales y charms, precio por uña', 'Estilo', 8, NULL, 'estilo-pedreria-joyas', false),
	('92cd9439-4ac0-4333-9e4d-b15954e80474', 'Manicura rusa', 450, 'Limpieza profunda de cutícula con técnica rusa y esmaltado al ras.', 'Manicura', 75, NULL, 'manicura-rusa', true),
	('a91f39d2-f3b6-4f2a-b645-b21b93bfc09b', 'Rubber Base', 300, 'Base niveladora de alta resistencia sobre la uña natural.', 'Manicura', 60, NULL, 'rubber-base', true),
	('9f5c7be4-3fbb-420b-84bf-eb0fdc183e98', 'French rosa pálido', 350, 'French clásico en tono rosa pálido.', 'Diseño', 50, NULL, 'french-rosa-palido', true),
	('2a706c55-092f-47e5-bc8e-60cdf776236c', 'Esmaltado', 250, 'Esmaltado semipermanente en color liso.', 'Semipermanente', 45, NULL, 'esmaltado', true),
	('6a2724a5-94bf-4d59-a5a2-53c0716b2358', 'Diseño', 150, 'Diseño a elección en las uñas indicadas.', 'Nail Art', 30, NULL, 'diseno', true),
	('20a3af05-aa8f-4443-9cbf-c31f068a3f25', 'Soft gel', 550, 'Extensión con tips de soft gel y acabado natural.', 'Extensiones', 90, NULL, 'soft-gel', true),
	('60f378ec-7343-42d8-89f5-b29b34c95739', 'Nail Art', 200, 'Arte a mano alzada, pedrería o efectos especiales.', 'Nail Art', 40, NULL, 'nail-art', true),
	('543077f5-1a64-43a2-8236-69f787adcd9e', 'Soft Glam + Pedrería', 850, 'Incluye extensiones en soft gel, glam y pedrería.', 'Extensiones', 120, NULL, 'soft-glam-pedreria', true),
	('b291c61c-ed6b-4635-98c6-5ba016bf34c5', 'Efecto Chrome', 380, 'Acabado espejo cromado.', 'Diseño', 45, NULL, 'efecto-chrome', true);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."appointments" ("id", "date", "startTime", "endTime", "status", "notes", "createdAt", "serviceId", "userId", "priceAtBooking", "durationMin") VALUES
	('e2f2b8f0-2b20-4190-998e-31781283322a', '2026-09-16', '09:00', '10:00', 'cancelled', NULL, '2026-09-08 14:35:29.46501', 'c536aabd-cc48-4754-b0d8-39625292aa2a', '6be42f11-0950-4ef5-9fd7-a62e891acf76', 350, 60),
	('3732b246-f4fe-4841-b5fa-3a7d3ed845dd', '2026-09-15', '09:00', '10:00', 'cancelled', NULL, '2026-09-08 14:35:29.06833', 'c536aabd-cc48-4754-b0d8-39625292aa2a', '6be42f11-0950-4ef5-9fd7-a62e891acf76', 350, 60),
	('a22d58bb-3c6f-4157-84e4-e43ae7486c6f', '2026-09-23', '16:00', '17:00', 'cancelled', NULL, '2026-09-08 14:37:13.458855', 'c536aabd-cc48-4754-b0d8-39625292aa2a', '6be42f11-0950-4ef5-9fd7-a62e891acf76', 350, 60),
	('811c0761-e9a0-49e7-8172-0ee43f43cd27', '2026-09-22', '15:30', '16:30', 'cancelled', NULL, '2026-09-08 14:36:37.721109', 'c536aabd-cc48-4754-b0d8-39625292aa2a', '6be42f11-0950-4ef5-9fd7-a62e891acf76', 350, 60),
	('30ea2817-3c0c-4e8d-8a3e-ba70a5c2eebc', '2026-09-09', '17:30', '19:10', 'cancelled', NULL, '2026-09-09 05:05:24.452649', '6a2724a5-94bf-4d59-a5a2-53c0716b2358', '97363c25-dcda-4166-8ee5-fd0d653c634c', 650, 100),
	('f48fc950-d71e-4f94-83cc-6ac4232495b6', '2026-09-09', '19:30', '21:23', 'cancelled', NULL, '2026-09-09 04:33:28.457539', 'c536aabd-cc48-4754-b0d8-39625292aa2a', '97363c25-dcda-4166-8ee5-fd0d653c634c', 790, 113),
	('2a905ee1-fa36-4257-b15b-76bac1f4ee40', '2026-09-15', '19:30', '20:30', 'cancelled', NULL, '2026-09-08 19:18:55.713729', '911e226a-29a4-40a4-b5ea-697ae1cc8b73', '97363c25-dcda-4166-8ee5-fd0d653c634c', 380, 60),
	('ad1fd572-1190-4750-bfbc-20609d45da50', '2026-09-15', '20:30', '21:45', 'cancelled', NULL, '2026-09-08 20:59:44.760146', '911e226a-29a4-40a4-b5ea-697ae1cc8b73', '97363c25-dcda-4166-8ee5-fd0d653c634c', 530, 75);


--
-- Data for Name: appointment_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."appointment_items" ("id", "appointmentId", "serviceId", "nameAtBooking", "priceAtBooking", "createdAt") VALUES
	('59103f84-598f-42d0-9cfc-37c05571bed4', '2a905ee1-fa36-4257-b15b-76bac1f4ee40', '911e226a-29a4-40a4-b5ea-697ae1cc8b73', 'Manicura + Esmaltado Cat eye', 380, '2026-09-08 19:18:55.713729+00'),
	('e9142476-e6b0-45f6-a4d0-7f88aea5b442', 'ad1fd572-1190-4750-bfbc-20609d45da50', '911e226a-29a4-40a4-b5ea-697ae1cc8b73', 'Manicura + Esmaltado Cat eye', 380, '2026-09-08 20:59:44.760146+00'),
	('83c4ac87-4529-4a7f-8fed-02fca0de5bd9', 'ad1fd572-1190-4750-bfbc-20609d45da50', '01846b41-8720-4213-b04f-8a93af75193b', 'Ojo de gato', 150, '2026-09-08 20:59:44.760146+00'),
	('827a218e-38a0-4a25-8790-093cd1f39580', 'f48fc950-d71e-4f94-83cc-6ac4232495b6', 'c536aabd-cc48-4754-b0d8-39625292aa2a', 'Manicura ', 350, '2026-09-09 04:33:28.457539+00'),
	('265cde06-8ba2-405d-9496-a8a772551385', 'f48fc950-d71e-4f94-83cc-6ac4232495b6', '25fe04fa-d68e-4297-b3f6-f987157b1458', 'Encapsulado de glitter', 200, '2026-09-09 04:33:28.457539+00'),
	('25215fed-192f-46bb-a713-9f1a7976dec9', 'f48fc950-d71e-4f94-83cc-6ac4232495b6', 'c39dddde-0293-4d44-bdd1-9a42404d0b41', 'Efecto espejo / aura', 180, '2026-09-09 04:33:28.457539+00'),
	('1d2d08b3-5eab-4682-912f-ecb29ed7f68c', 'f48fc950-d71e-4f94-83cc-6ac4232495b6', 'b9b2a3df-ce8f-45d9-a7a6-a80ca544b225', 'Pedrería y joyas (por uña)', 60, '2026-09-09 04:33:28.457539+00'),
	('932f0b30-48fa-4954-8673-2a162a0ff125', '30ea2817-3c0c-4e8d-8a3e-ba70a5c2eebc', '6a2724a5-94bf-4d59-a5a2-53c0716b2358', 'Diseño', 150, '2026-09-09 05:05:24.452649+00'),
	('73353fec-b0e9-4a24-bad2-10f3114cb842', '30ea2817-3c0c-4e8d-8a3e-ba70a5c2eebc', NULL, 'Diseños Cardone', 500, '2026-09-09 05:05:24.452649+00');


--
-- Data for Name: availability_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."availability_rules" ("id", "weekday", "startTime", "endTime", "slotIntervalMin", "isActive") VALUES
	('c9de8d83-4522-4f38-aad8-157f33513c9c', 0, '13:00', '22:00', 30, true),
	('6b65ff40-201d-4597-8fa7-5a4c9bcd25a7', 1, '17:30', '22:00', 30, true),
	('fc4cb59d-10bc-4565-bb41-a94cbceb71ce', 2, '17:30', '22:00', 30, true),
	('3eace64f-ca5c-4c82-905f-ecab5e396c59', 3, '17:30', '22:00', 30, true),
	('14cea346-aa22-4319-b4c7-64713c5e952e', 4, '17:30', '22:00', 30, true),
	('f5017dac-171d-4338-942f-a6c319c392ff', 5, '16:30', '22:00', 30, true),
	('dadebbd8-6fee-4f0e-879b-4707b7bcd65a', 6, '13:00', '22:00', 30, true);


--
-- Data for Name: time_off; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict z1YBhUdDY7B0cZVb0enG1wib58NwPufGvPgH2V5CZfHCMudf9sHtQdxqkKysWAx

RESET ALL;
