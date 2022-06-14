CREATE SCHEMA IF NOT EXISTS node_vs_dart;

CREATE TABLE IF NOT EXISTS node_vs_dart.charge_locations (
	id SERIAL PRIMARY KEY,
	UUID TEXT NOT NULL,
	operator_id integer,
	address_name TEXT,
	address_line_1 TEXT NOT NULL,
	address_line_2 TEXT,
	address_city TEXT,
	address_state TEXT,
	address_postalcode TEXT,
	address_country TEXT NOT NULL,
	latitude REAL NOT NULL,
	longitude REAL NOT NULL,
	contact_phone TEXT,
	contact_email TEXT
);