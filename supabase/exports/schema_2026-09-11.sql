


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."rango_cita"("d" "date", "inicio" "text", "fin" "text") RETURNS "tsrange"
    LANGUAGE "sql" IMMUTABLE
    AS $$
  select tsrange(
    d::timestamp + make_interval(
      hours => split_part(inicio, ':', 1)::int,
      mins  => split_part(inicio, ':', 2)::int
    ),
    d::timestamp + make_interval(
      hours => split_part(fin, ':', 1)::int,
      mins  => split_part(fin, ':', 2)::int
    )
  )
$$;


ALTER FUNCTION "public"."rango_cita"("d" "date", "inicio" "text", "fin" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointment_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointmentId" "uuid" NOT NULL,
    "serviceId" "uuid",
    "nameAtBooking" "text" NOT NULL,
    "priceAtBooking" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."appointment_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "date" "date" NOT NULL,
    "startTime" "text" NOT NULL,
    "endTime" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "notes" "text",
    "createdAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "serviceId" "uuid",
    "userId" "uuid",
    "priceAtBooking" double precision,
    "durationMin" integer DEFAULT 60 NOT NULL,
    CONSTRAINT "chk_appointments_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'cancelled'::"text", 'done'::"text"]))),
    CONSTRAINT "chk_appointments_times" CHECK ((("endTime")::time without time zone > ("startTime")::time without time zone))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability_rules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "weekday" integer NOT NULL,
    "startTime" "text" NOT NULL,
    "endTime" "text" NOT NULL,
    "slotIntervalMin" integer DEFAULT 30 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "chk_availability_slot" CHECK (("slotIntervalMin" > 0)),
    CONSTRAINT "chk_availability_weekday" CHECK ((("weekday" >= 0) AND ("weekday" <= 6)))
);


ALTER TABLE "public"."availability_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."idempotency_keys" (
    "key" "text" NOT NULL,
    "userId" "uuid",
    "method" "text" NOT NULL,
    "path" "text" NOT NULL,
    "statusCode" integer,
    "response" "jsonb",
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."idempotency_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "price" double precision DEFAULT '0'::double precision NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "durationMin" integer DEFAULT 60 NOT NULL,
    "image" "text",
    "slug" "text" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "chk_services_duration" CHECK (("durationMin" > 0)),
    CONSTRAINT "chk_services_price" CHECK (("price" >= (0)::double precision))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_off" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "date" "date" NOT NULL,
    "startTime" "text",
    "endTime" "text",
    "reason" "text"
);


ALTER TABLE "public"."time_off" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "password" "text",
    "fullName" "text" NOT NULL,
    "phone" "text",
    "isActive" boolean DEFAULT true NOT NULL,
    "roles" "text"[] DEFAULT '{client}'::"text"[] NOT NULL,
    "googleId" "text",
    "avatarUrl" "text",
    CONSTRAINT "chk_users_roles" CHECK (("roles" <@ ARRAY['admin'::"text", 'client'::"text"]))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointment_items"
    ADD CONSTRAINT "appointment_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "no_overlap_citas" EXCLUDE USING "gist" ("public"."rango_cita"("date", "startTime", "endTime") WITH &&) WHERE (("status" <> 'cancelled'::"text"));



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "pk_appointments" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_rules"
    ADD CONSTRAINT "pk_availability_rules" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."idempotency_keys"
    ADD CONSTRAINT "pk_idempotency_keys" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "pk_services" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off"
    ADD CONSTRAINT "pk_time_off" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "pk_users" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "uq_services_name" UNIQUE ("name");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "uq_services_slug" UNIQUE ("slug");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "uq_users_email" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "uq_users_google_id" UNIQUE ("googleId");



CREATE INDEX "idx_appointment_items_appointment" ON "public"."appointment_items" USING "btree" ("appointmentId");



CREATE INDEX "idx_appointments_date_start" ON "public"."appointments" USING "btree" ("date", "startTime");



CREATE INDEX "idx_idempotency_keys_created" ON "public"."idempotency_keys" USING "btree" ("createdAt");



ALTER TABLE ONLY "public"."appointment_items"
    ADD CONSTRAINT "appointment_items_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_items"
    ADD CONSTRAINT "appointment_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "fk_appointments_service" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "fk_appointments_user" FOREIGN KEY ("userId") REFERENCES "public"."users"("id");



ALTER TABLE "public"."appointment_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."availability_rules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "catalogo_publico_select" ON "public"."services" FOR SELECT TO "authenticated", "anon" USING (("isActive" = true));



CREATE POLICY "citas_insert_propias" ON "public"."appointments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "userId"));



CREATE POLICY "citas_select_propias" ON "public"."appointments" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "userId"));



ALTER TABLE "public"."idempotency_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuarios_select_propio" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "usuarios_update_propio" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."rango_cita"("d" "date", "inicio" "text", "fin" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rango_cita"("d" "date", "inicio" "text", "fin" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rango_cita"("d" "date", "inicio" "text", "fin" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."appointment_items" TO "anon";
GRANT ALL ON TABLE "public"."appointment_items" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_items" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."availability_rules" TO "anon";
GRANT ALL ON TABLE "public"."availability_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_rules" TO "service_role";



GRANT ALL ON TABLE "public"."idempotency_keys" TO "anon";
GRANT ALL ON TABLE "public"."idempotency_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."idempotency_keys" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."time_off" TO "anon";
GRANT ALL ON TABLE "public"."time_off" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







