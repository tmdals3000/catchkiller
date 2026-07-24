package com.sejong.catchkiller.vote;

import java.util.Map;

public record VoteTallyResponse(Map<String, Long> votes, long total) {
}
