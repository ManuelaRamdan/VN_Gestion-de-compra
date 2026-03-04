--
-- PostgreSQL database dump
--

\restrict PfZdMmDxLWYjeKAQ2J7zCLXXwRvltqakBKpxRF7xXydHMoYblzlN7ZmPU5nOveG

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-26 15:19:13

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
-- TOC entry 909 (class 1247 OID 24864)
-- Name: nivel_calificacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_calificacion AS ENUM (
    'malo',
    'regular',
    'bueno',
    'muybueno'
);


ALTER TYPE public.nivel_calificacion OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 24941)
-- Name: nivelcalificacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivelcalificacion AS ENUM (
    'malo',
    'regular',
    'bueno',
    'muybueno'
);


ALTER TYPE public.nivelcalificacion OWNER TO postgres;

--
-- TOC entry 921 (class 1247 OID 24974)
-- Name: tipo_respuesta_proveedor; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_respuesta_proveedor AS ENUM (
    'POSITIVA',
    'NEGATIVA',
    'PENDIENTE'
);


ALTER TYPE public.tipo_respuesta_proveedor OWNER TO postgres;

--
-- TOC entry 4931 (class 2605 OID 24950)
-- Name: CAST (public.nivelcalificacion AS character varying); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (public.nivelcalificacion AS character varying) WITH INOUT AS IMPLICIT;


--
-- TOC entry 4851 (class 2605 OID 24949)
-- Name: CAST (character varying AS public.nivelcalificacion); Type: CAST; Schema: -; Owner: -
--

CREATE CAST (character varying AS public.nivelcalificacion) WITH INOUT AS IMPLICIT;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 16625)
-- Name: aprobacion_presupuesto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aprobacion_presupuesto (
    id_aprobacion_presu integer NOT NULL,
    id_presupuesto integer,
    id_usuario integer,
    fecha timestamp(6) without time zone DEFAULT CURRENT_DATE,
    estado character varying(50) DEFAULT 'Pendiente'::character varying
);


ALTER TABLE public.aprobacion_presupuesto OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16624)
-- Name: aprobacion_presupuesto_id_aprobacion_presu_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aprobacion_presupuesto_id_aprobacion_presu_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aprobacion_presupuesto_id_aprobacion_presu_seq OWNER TO postgres;

--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 235
-- Name: aprobacion_presupuesto_id_aprobacion_presu_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aprobacion_presupuesto_id_aprobacion_presu_seq OWNED BY public.aprobacion_presupuesto.id_aprobacion_presu;


--
-- TOC entry 230 (class 1259 OID 16551)
-- Name: aprobacion_solicitud; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aprobacion_solicitud (
    id_aprob_solicitud integer NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying,
    fecha timestamp(6) without time zone,
    id_solicitud integer,
    id_usuario integer,
    comentarios text
);


ALTER TABLE public.aprobacion_solicitud OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16550)
-- Name: aprobacion_solicitud_id_aprob_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.aprobacion_solicitud ALTER COLUMN id_aprob_solicitud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.aprobacion_solicitud_id_aprob_solicitud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 246 (class 1259 OID 25020)
-- Name: cierre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cierre (
    id_cierre integer NOT NULL,
    id_eval_entrega integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha_cierre date DEFAULT CURRENT_DATE NOT NULL,
    observaciones character varying(255)
);


ALTER TABLE public.cierre OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 25019)
-- Name: cierre_id_cierre_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cierre_id_cierre_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cierre_id_cierre_seq OWNER TO postgres;

--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 245
-- Name: cierre_id_cierre_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cierre_id_cierre_seq OWNED BY public.cierre.id_cierre;


--
-- TOC entry 238 (class 1259 OID 16709)
-- Name: compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra (
    id_compra integer NOT NULL,
    id_aprobacion_presu integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha_solicitud date DEFAULT CURRENT_DATE NOT NULL,
    fecha_recepcion date,
    factura_pdf_path character varying(255)
);


ALTER TABLE public.compra OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16708)
-- Name: compra_id_compra_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compra_id_compra_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compra_id_compra_seq OWNER TO postgres;

--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 237
-- Name: compra_id_compra_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compra_id_compra_seq OWNED BY public.compra.id_compra;


--
-- TOC entry 242 (class 1259 OID 24952)
-- Name: evaluacion_entrega; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_entrega (
    id_evaluacion_entrega integer NOT NULL,
    id_compra integer NOT NULL,
    fecha_entrega date NOT NULL,
    cumple_condiciones boolean DEFAULT true NOT NULL,
    observaciones text
);


ALTER TABLE public.evaluacion_entrega OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 24951)
-- Name: evaluacion_entrega_id_evaluacion_entrega_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluacion_entrega_id_evaluacion_entrega_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluacion_entrega_id_evaluacion_entrega_seq OWNER TO postgres;

--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 241
-- Name: evaluacion_entrega_id_evaluacion_entrega_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluacion_entrega_id_evaluacion_entrega_seq OWNED BY public.evaluacion_entrega.id_evaluacion_entrega;


--
-- TOC entry 240 (class 1259 OID 24904)
-- Name: evaluacion_proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_proveedor (
    id_evaluacion_proveedor integer NOT NULL,
    id_proveedor integer NOT NULL,
    id_usuario integer NOT NULL,
    servicioproducto character varying(150),
    periodoevaluado integer,
    fecha timestamp(6) without time zone DEFAULT CURRENT_DATE,
    calidadproducto public.nivel_calificacion NOT NULL,
    cumplimientoplazos public.nivel_calificacion NOT NULL,
    atencioncliente public.nivel_calificacion NOT NULL,
    respuestareclamos public.nivel_calificacion NOT NULL,
    precioservicio public.nivel_calificacion NOT NULL,
    gestionadministrativa public.nivel_calificacion NOT NULL,
    resultado numeric(5,2),
    nivelaprobacion numeric(5,2) DEFAULT 70.00,
    proveedorsgc boolean,
    aprobado boolean,
    comentarios text,
    firma_responsable character varying(100)
);


ALTER TABLE public.evaluacion_proveedor OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 24903)
-- Name: evaluacion_proveedor_id_evaluacion_proveedor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluacion_proveedor_id_evaluacion_proveedor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluacion_proveedor_id_evaluacion_proveedor_seq OWNER TO postgres;

--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 239
-- Name: evaluacion_proveedor_id_evaluacion_proveedor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluacion_proveedor_id_evaluacion_proveedor_seq OWNED BY public.evaluacion_proveedor.id_evaluacion_proveedor;


--
-- TOC entry 224 (class 1259 OID 16515)
-- Name: nivel_prioridad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nivel_prioridad (
    id_nivel_prioridad integer NOT NULL,
    categoria character varying(255),
    dias integer,
    activo boolean DEFAULT true
);


ALTER TABLE public.nivel_prioridad OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16514)
-- Name: nivel_prioridad_id_nivel_prioridad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.nivel_prioridad ALTER COLUMN id_nivel_prioridad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.nivel_prioridad_id_nivel_prioridad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16594)
-- Name: presupuesto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuesto (
    id_presupuesto integer NOT NULL,
    id_proveedor integer NOT NULL,
    id_aprob_solicitud integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha_solicitud date DEFAULT CURRENT_DATE,
    fecha_recepcion date,
    cotizacion_satisfactoria boolean DEFAULT false,
    observaciones text,
    archivo_pdf_path character varying(255)
);


ALTER TABLE public.presupuesto OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16593)
-- Name: presupuesto_id_presupuesto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuesto_id_presupuesto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.presupuesto_id_presupuesto_seq OWNER TO postgres;

--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 233
-- Name: presupuesto_id_presupuesto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuesto_id_presupuesto_seq OWNED BY public.presupuesto.id_presupuesto;


--
-- TOC entry 226 (class 1259 OID 16522)
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    id_producto integer NOT NULL,
    nombre character varying(255),
    activo boolean DEFAULT true
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16521)
-- Name: producto_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.producto ALTER COLUMN id_producto ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.producto_id_producto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16583)
-- Name: proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedor (
    id_proveedor integer NOT NULL,
    nombre_empresa character varying(100) NOT NULL,
    nombre_contacto character varying(100),
    mail character varying(100),
    direccion character varying(255),
    telefono bigint,
    activo boolean DEFAULT true
);


ALTER TABLE public.proveedor OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16582)
-- Name: proveedor_id_proveedor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedor_id_proveedor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedor_id_proveedor_seq OWNER TO postgres;

--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 231
-- Name: proveedor_id_proveedor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedor_id_proveedor_seq OWNED BY public.proveedor.id_proveedor;


--
-- TOC entry 244 (class 1259 OID 24982)
-- Name: reclamo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reclamo (
    id_reclamo integer NOT NULL,
    id_evaluacion_entrega integer NOT NULL,
    fecha_reclamo date DEFAULT CURRENT_DATE NOT NULL,
    respuesta_proveedor public.tipo_respuesta_proveedor DEFAULT 'PENDIENTE'::public.tipo_respuesta_proveedor,
    es_recurrente boolean DEFAULT false,
    producto_rechazado boolean DEFAULT false,
    entrega_nueva boolean DEFAULT false,
    satisfecho_nueva_entrega boolean,
    detalle_reclamo text,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.reclamo OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 24981)
-- Name: reclamo_id_reclamo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reclamo_id_reclamo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reclamo_id_reclamo_seq OWNER TO postgres;

--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 243
-- Name: reclamo_id_reclamo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reclamo_id_reclamo_seq OWNED BY public.reclamo.id_reclamo;


--
-- TOC entry 220 (class 1259 OID 16487)
-- Name: sector; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sector (
    id_sector integer NOT NULL,
    nombre character varying(255),
    activo boolean DEFAULT true
);


ALTER TABLE public.sector OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16486)
-- Name: sector_id_sector_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sector ALTER COLUMN id_sector ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sector_id_sector_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16529)
-- Name: solicitud; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud (
    id_solicitud integer NOT NULL,
    cantidad integer,
    fecha timestamp(6) without time zone,
    fecha_admisible timestamp(6) without time zone,
    id_nivel_prioridad integer,
    id_producto integer,
    id_usuario integer,
    cerrado boolean DEFAULT false,
    comentarios text
);


ALTER TABLE public.solicitud OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16528)
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.solicitud ALTER COLUMN id_solicitud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.solicitud_id_solicitud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16500)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    activo boolean,
    password character varying(255),
    username character varying(255),
    id_sector integer
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16499)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuario ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4942 (class 2604 OID 16628)
-- Name: aprobacion_presupuesto id_aprobacion_presu; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_presupuesto ALTER COLUMN id_aprobacion_presu SET DEFAULT nextval('public.aprobacion_presupuesto_id_aprobacion_presu_seq'::regclass);


--
-- TOC entry 4959 (class 2604 OID 25023)
-- Name: cierre id_cierre; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cierre ALTER COLUMN id_cierre SET DEFAULT nextval('public.cierre_id_cierre_seq'::regclass);


--
-- TOC entry 4945 (class 2604 OID 16712)
-- Name: compra id_compra; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra ALTER COLUMN id_compra SET DEFAULT nextval('public.compra_id_compra_seq'::regclass);


--
-- TOC entry 4950 (class 2604 OID 24955)
-- Name: evaluacion_entrega id_evaluacion_entrega; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_entrega ALTER COLUMN id_evaluacion_entrega SET DEFAULT nextval('public.evaluacion_entrega_id_evaluacion_entrega_seq'::regclass);


--
-- TOC entry 4947 (class 2604 OID 24907)
-- Name: evaluacion_proveedor id_evaluacion_proveedor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_proveedor ALTER COLUMN id_evaluacion_proveedor SET DEFAULT nextval('public.evaluacion_proveedor_id_evaluacion_proveedor_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 16597)
-- Name: presupuesto id_presupuesto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto ALTER COLUMN id_presupuesto SET DEFAULT nextval('public.presupuesto_id_presupuesto_seq'::regclass);


--
-- TOC entry 4937 (class 2604 OID 16586)
-- Name: proveedor id_proveedor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor ALTER COLUMN id_proveedor SET DEFAULT nextval('public.proveedor_id_proveedor_seq'::regclass);


--
-- TOC entry 4952 (class 2604 OID 24985)
-- Name: reclamo id_reclamo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamo ALTER COLUMN id_reclamo SET DEFAULT nextval('public.reclamo_id_reclamo_seq'::regclass);



COPY public.nivel_prioridad (id_nivel_prioridad, categoria, dias, activo) FROM stdin;
1	Urgencia inmediata	7	t
2	Urgencia media	30	t
3	Urgencia baja	40	t
\.


COPY public.producto (id_producto, nombre, activo) FROM stdin;
2	Lapiceras	t
1	Hojas A3	t
3	Calibrador	t

\.


--
-- TOC entry 5176 (class 0 OID 16583)
-- Dependencies: 232
-- Data for Name: proveedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedor (id_proveedor, nombre_empresa, nombre_contacto, mail, direccion, telefono, activo) FROM stdin;
1	Librería Central	Juan Pérez	ventas@central.com	Av. Siempreviva 742	1144556677	t
2	Espiritu Dulcero	Juan Pérez	ventas@central.com	Av. Siempreviva 742	1144556677	t
\.



COPY public.sector (id_sector, nombre, activo) FROM stdin;
2	CALIDAD	t
3	GERENCIA	t
1	ADMINISTRACION	t
\.



COPY public.usuario (id_usuario, activo, password, username, id_sector) FROM stdin;
6	f	$2a$10$sw1ln.lJq7XcARguKMLxYu7pS9FZyM01.apjQOohnXs7/64cQS4a.	Juan123	2
10	t	$2a$10$GAsUJQhSHSyFliQRvnK2YOFeiA0ixxLmc2ecWKJE/sUhze2k38Z6q	admin	1
14	t	$2a$10$1/JZ/F/F6i7Dh2R36mQ/N.l7vUJolID/0UYlvUD5SmrRT7M.5AJ8q	user2	2
9	f	$2a$10$MQCd6yzt5LEGAbndMP/Q0.m1rrQwLHeb9AmsXvCk4vYF2uFrSAvKS	manu	2
11	f	$2a$10$mCfTCL/cLdIwtqAT8xli1ODYyx77jq4wG6gek.ZlotHzc8iEM6whq	calidad	2
12	f	$2a$10$ZlXtu934ieMEFouu9EA41uae1YRkbLpULzZyryOeA82iE2p1AvQ5e	manu	2
8	f	$2a$10$a1aJlQWZzKgcwLot5IFdW.hUZNVJzkmRhz1IH6x473d.RH7X1dVB2	manu	2
2	f	$2a$10$SzaJmGpFh4C1xOxWSd6P4u8IFliywxHBVIAzxBT2lU1bjyOALwZly	pepe123	2
3	f	$2a$10$wke2GGXTO2J9g7..C//T9.FxmdiSkkLEH8sAZOFJiHLYoqXdGSQ9e	gerencia	3
7	f	$2a$10$hJ4jfM8p9ZsqMs67Z6sYoecoidHo5j3zn1TLZUbCxHA.gPFR6rFhq	juan	2
13	f	$2a$10$XaiX/Fh7MqVOjztVLS22dOCsjReHSqR/kVayJHA9tQVq/TkFgCQFG	gualy	2
4	f	$2a$10$CQQ9l.aRxvFcAf9N3NUwr.ERhMNNX5uw0LnQYS1ZBoHXyMkvWHWJK	pepe	1
5	t	$2a$10$kSJeX6SdWJ20xpZ.mYSUlu0DalZjyLplqMjpc16ng/MRScTYvwnWy	luis	3
15	f	$2a$10$OXLiS371mdyR/81/x3YajuKFLaKYdoH954AefkwekyoLrzsPWq99K	matias	1
1	f	$2a$10$HLL0MGfFaSMF.ThPAXFF2.kHYntYqlpE4pQQPbAR55wblh0oRcyJm	Juan125	1
16	f	$2a$10$SBUCsNRdP.w2V8T5twa01.YrWUNGQNhT2g8NIr/P40Z2gbsHilsRe	pepe	1
17	f	$2a$10$JRkdshvTBN9ctf1.v56ukuMvZImRdSVf7t2Kd3cmPMawxZez0OOAG	guadalupe	1
18	t	$2a$10$KkOesDD9fxS64ySHnvmFpO5/6SWj79bp/ajNrkAmJyaIAHvcJ.iwG	empleado1	1
\.


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 235
-- Name: aprobacion_presupuesto_id_aprobacion_presu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprobacion_presupuesto_id_aprobacion_presu_seq', 32, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 229
-- Name: aprobacion_solicitud_id_aprob_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprobacion_solicitud_id_aprob_solicitud_seq', 23, true);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 245
-- Name: cierre_id_cierre_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cierre_id_cierre_seq', 11, true);


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 237
-- Name: compra_id_compra_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compra_id_compra_seq', 18, true);


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 241
-- Name: evaluacion_entrega_id_evaluacion_entrega_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluacion_entrega_id_evaluacion_entrega_seq', 15, true);


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 239
-- Name: evaluacion_proveedor_id_evaluacion_proveedor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluacion_proveedor_id_evaluacion_proveedor_seq', 5, true);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 223
-- Name: nivel_prioridad_id_nivel_prioridad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nivel_prioridad_id_nivel_prioridad_seq', 5, true);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 233
-- Name: presupuesto_id_presupuesto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuesto_id_presupuesto_seq', 32, true);


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 225
-- Name: producto_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_id_producto_seq', 6, true);


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 231
-- Name: proveedor_id_proveedor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedor_id_proveedor_seq', 3, true);


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 243
-- Name: reclamo_id_reclamo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reclamo_id_reclamo_seq', 10, true);


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 219
-- Name: sector_id_sector_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sector_id_sector_seq', 5, true);


--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 227
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_id_solicitud_seq', 23, true);


--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 18, true);


--
-- TOC entry 4978 (class 2606 OID 16637)
-- Name: aprobacion_presupuesto aprobacion_presupuesto_id_presupuesto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_presupuesto
    ADD CONSTRAINT aprobacion_presupuesto_id_presupuesto_key UNIQUE (id_presupuesto);


--
-- TOC entry 4980 (class 2606 OID 16635)
-- Name: aprobacion_presupuesto aprobacion_presupuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_presupuesto
    ADD CONSTRAINT aprobacion_presupuesto_pkey PRIMARY KEY (id_aprobacion_presu);


--
-- TOC entry 4972 (class 2606 OID 16557)
-- Name: aprobacion_solicitud aprobacion_solicitud_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_solicitud
    ADD CONSTRAINT aprobacion_solicitud_pkey PRIMARY KEY (id_aprob_solicitud);


--
-- TOC entry 4994 (class 2606 OID 25032)
-- Name: cierre cierre_id_eval_entrega_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cierre
    ADD CONSTRAINT cierre_id_eval_entrega_key UNIQUE (id_eval_entrega);


--
-- TOC entry 4996 (class 2606 OID 25030)
-- Name: cierre cierre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cierre
    ADD CONSTRAINT cierre_pkey PRIMARY KEY (id_cierre);


--
-- TOC entry 4982 (class 2606 OID 16720)
-- Name: compra compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_pkey PRIMARY KEY (id_compra);


--
-- TOC entry 4986 (class 2606 OID 24965)
-- Name: evaluacion_entrega evaluacion_entrega_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_entrega
    ADD CONSTRAINT evaluacion_entrega_pkey PRIMARY KEY (id_evaluacion_entrega);


--
-- TOC entry 4984 (class 2606 OID 24922)
-- Name: evaluacion_proveedor evaluacion_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_proveedor
    ADD CONSTRAINT evaluacion_proveedor_pkey PRIMARY KEY (id_evaluacion_proveedor);


--
-- TOC entry 4966 (class 2606 OID 16520)
-- Name: nivel_prioridad nivel_prioridad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nivel_prioridad
    ADD CONSTRAINT nivel_prioridad_pkey PRIMARY KEY (id_nivel_prioridad);


--
-- TOC entry 4976 (class 2606 OID 16608)
-- Name: presupuesto presupuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto
    ADD CONSTRAINT presupuesto_pkey PRIMARY KEY (id_presupuesto);


--
-- TOC entry 4968 (class 2606 OID 16527)
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id_producto);


--
-- TOC entry 4974 (class 2606 OID 16592)
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor);


--
-- TOC entry 4990 (class 2606 OID 24999)
-- Name: reclamo reclamo_id_evaluacion_entrega_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamo
    ADD CONSTRAINT reclamo_id_evaluacion_entrega_key UNIQUE (id_evaluacion_entrega);


--
-- TOC entry 4992 (class 2606 OID 24997)
-- Name: reclamo reclamo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamo
    ADD CONSTRAINT reclamo_pkey PRIMARY KEY (id_reclamo);


--
-- TOC entry 4962 (class 2606 OID 16571)
-- Name: sector sector_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sector
    ADD CONSTRAINT sector_pkey PRIMARY KEY (id_sector);


--
-- TOC entry 4970 (class 2606 OID 16534)
-- Name: solicitud solicitud_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT solicitud_pkey PRIMARY KEY (id_solicitud);


--
-- TOC entry 4964 (class 2606 OID 16507)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4987 (class 1259 OID 24971)
-- Name: idx_eval_entrega_compra; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eval_entrega_compra ON public.evaluacion_entrega USING btree (id_compra);


--
-- TOC entry 4988 (class 1259 OID 24972)
-- Name: idx_eval_entrega_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eval_entrega_fecha ON public.evaluacion_entrega USING btree (fecha_entrega);


--
-- TOC entry 5006 (class 2606 OID 16638)
-- Name: aprobacion_presupuesto aprobacion_presupuesto_id_presupuesto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_presupuesto
    ADD CONSTRAINT aprobacion_presupuesto_id_presupuesto_fkey FOREIGN KEY (id_presupuesto) REFERENCES public.presupuesto(id_presupuesto);


--
-- TOC entry 5007 (class 2606 OID 16643)
-- Name: aprobacion_presupuesto aprobacion_presupuesto_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_presupuesto
    ADD CONSTRAINT aprobacion_presupuesto_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5001 (class 2606 OID 16558)
-- Name: aprobacion_solicitud fk_aprob_solicitud_solicitud; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_solicitud
    ADD CONSTRAINT fk_aprob_solicitud_solicitud FOREIGN KEY (id_solicitud) REFERENCES public.solicitud(id_solicitud);


--
-- TOC entry 5002 (class 2606 OID 16563)
-- Name: aprobacion_solicitud fk_aprob_solicitud_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprobacion_solicitud
    ADD CONSTRAINT fk_aprob_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5014 (class 2606 OID 25033)
-- Name: cierre fk_cierre_compra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cierre
    ADD CONSTRAINT fk_cierre_compra FOREIGN KEY (id_eval_entrega) REFERENCES public.evaluacion_entrega(id_evaluacion_entrega);


--
-- TOC entry 5015 (class 2606 OID 25038)
-- Name: cierre fk_cierre_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cierre
    ADD CONSTRAINT fk_cierre_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5008 (class 2606 OID 16721)
-- Name: compra fk_compra_aprobacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT fk_compra_aprobacion FOREIGN KEY (id_aprobacion_presu) REFERENCES public.aprobacion_presupuesto(id_aprobacion_presu);


--
-- TOC entry 5009 (class 2606 OID 16726)
-- Name: compra fk_compra_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5012 (class 2606 OID 24966)
-- Name: evaluacion_entrega fk_eval_entrega_compra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_entrega
    ADD CONSTRAINT fk_eval_entrega_compra FOREIGN KEY (id_compra) REFERENCES public.compra(id_compra) ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 25000)
-- Name: reclamo fk_evaluacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamo
    ADD CONSTRAINT fk_evaluacion FOREIGN KEY (id_evaluacion_entrega) REFERENCES public.evaluacion_entrega(id_evaluacion_entrega) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 24923)
-- Name: evaluacion_proveedor fk_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_proveedor
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor);


--
-- TOC entry 4998 (class 2606 OID 16535)
-- Name: solicitud fk_solicitud_prioridad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT fk_solicitud_prioridad FOREIGN KEY (id_nivel_prioridad) REFERENCES public.nivel_prioridad(id_nivel_prioridad);


--
-- TOC entry 4999 (class 2606 OID 16540)
-- Name: solicitud fk_solicitud_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT fk_solicitud_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- TOC entry 5000 (class 2606 OID 16545)
-- Name: solicitud fk_solicitud_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5011 (class 2606 OID 24928)
-- Name: evaluacion_proveedor fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_proveedor
    ADD CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4997 (class 2606 OID 16573)
-- Name: usuario fk_usuario_sector; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usuario_sector FOREIGN KEY (id_sector) REFERENCES public.sector(id_sector);


--
-- TOC entry 5003 (class 2606 OID 16614)
-- Name: presupuesto presupuesto_id_aprob_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto
    ADD CONSTRAINT presupuesto_id_aprob_solicitud_fkey FOREIGN KEY (id_aprob_solicitud) REFERENCES public.aprobacion_solicitud(id_aprob_solicitud);


--
-- TOC entry 5004 (class 2606 OID 16609)
-- Name: presupuesto presupuesto_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto
    ADD CONSTRAINT presupuesto_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor);


--
-- TOC entry 5005 (class 2606 OID 16619)
-- Name: presupuesto presupuesto_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto
    ADD CONSTRAINT presupuesto_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


-- Completed on 2026-02-26 15:19:14

--
-- PostgreSQL database dump complete
--

\unrestrict PfZdMmDxLWYjeKAQ2J7zCLXXwRvltqakBKpxRF7xXydHMoYblzlN7ZmPU5nOveG

