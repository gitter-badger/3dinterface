diffTable;

EXP_ID = 1;
ARROW_ID = 2;
STARTED = 3;
TIME = 4;

% Compute diff tables, and split by exps

hovers = {};
map = [];

start = 1;
current_exp_id = M(1,EXP_ID);

for i = 1:length(M),

    if M(i, EXP_ID) ~= current_exp_id,

        current_exp_id = M(i, EXP_ID);
        start = start + 1;

    end

    map(i) = start;

end

hovers = cell(max(map), 1);

is_hovering = false;
current_hover = -1;
current_time = 0;

for i = 1:length(M),

    if M(i, STARTED),

        if (current_hover ~= -1 && M(i, ARROW_ID) ~= current_hover && is_hovering),

            % Add line for previous hovering
            hovers{map(M(i, EXP_ID))} = [hovers{map(M(i, EXP_ID))}; M(i, TIME) - current_time];

        end

        current_hover = M(i, ARROW_ID);
        current_time = M(i, TIME);

    else

        hovers{map(M(i, EXP_ID))} = [hovers{map(M(i, EXP_ID))}; M(i, TIME) - current_time];

    end

end

% All hover time
all_hovers = sort(vertcat(hovers{:}));

times = 0:0.001:0.6;

curve = zeros(length(times),1);

for i = 1 : length(times),

    curve(i) = sum(all_hovers < times(i));

end

plot(times, curve);

