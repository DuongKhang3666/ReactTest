package com.example.backend.service;

import java.sql.SQLException;
import java.util.regex.Pattern;

final class OccupiedSeatConstraint {
    private static final String NAME = "uk_tickets_occupied_seat";
    private static final Pattern MYSQL_KEY = Pattern.compile(
            "for key ['`](?:[^'`]+\\.)?" + NAME + "['`]", Pattern.CASE_INSENSITIVE);

    private OccupiedSeatConstraint() {}

    static boolean matches(Throwable failure) {
        for (Throwable cause = failure; cause != null; cause = cause.getCause()) {
            if (cause instanceof org.hibernate.exception.ConstraintViolationException violation) {
                String name = violation.getConstraintName();
                if (name != null && (NAME.equalsIgnoreCase(name)
                        || name.toLowerCase(java.util.Locale.ROOT).endsWith("." + NAME))) {
                    return true;
                }
            }
            if (cause instanceof SQLException sql && sql.getErrorCode() == 1062
                    && "23000".equals(sql.getSQLState()) && sql.getMessage() != null
                    && MYSQL_KEY.matcher(sql.getMessage()).find()) {
                return true;
            }
        }
        return false;
    }
}
