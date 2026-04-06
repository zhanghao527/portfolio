package com.portfolio.common.utils;

import org.springframework.beans.BeanUtils;

import java.util.List;
import java.util.stream.Collectors;

public class BeanCopyUtils {

    public static <T> T copyBean(Object source, Class<T> clazz) {
        T target;
        try {
            target = clazz.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(source, target);
        } catch (Exception e) {
            throw new RuntimeException("Bean copy failed", e);
        }
        return target;
    }

    public static <T> List<T> copyBeanList(List<?> sourceList, Class<T> clazz) {
        return sourceList.stream()
                .map(source -> copyBean(source, clazz))
                .collect(Collectors.toList());
    }
}
